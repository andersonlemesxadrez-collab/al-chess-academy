import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';
import { AlertTriangle, ArrowLeft, CheckCircle2, Flag, Loader2, Play, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockfishClient } from '../../utils/stockfishClient';
import { analyzeGame, mergeWeaknesses } from '../../utils/aiDiagnostics';
import type { DiagnosticReport } from '../../utils/aiDiagnostics';
import { BOT_LEVELS, BOT_LEVEL_LIST, getBotLevelId, thinkTime } from '../../utils/botLevels';
import type { BotLevelId } from '../../utils/botLevels';
import { getCheckSquare, playSoundForMove, safeGet, safeRemove, safeSet } from '../../utils/chessHelpers';
import { sounds } from '../../utils/audio';
import { ChessBoard } from '../chess/ChessBoard';
import { GameReview } from './GameReview';
import type { ContentItem, TaskAssignment } from '../../types/chess';

interface BotMatchViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack: () => void;
  onNext?: () => void;
}

type Outcome = 'win' | 'loss' | 'draw';

interface GameResult {
  outcome: Outcome;
  reason: string;
  text: string;
}

/** Partida em andamento, guardada no aparelho para continuar se o aluno sair ou recarregar. */
interface SavedGame {
  moves: string[];
  color: Color;
  elapsed: number;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidFen(fen?: string): fen is string {
  if (!fen) return false;
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

function describeResult(g: Chess, player: Color, botName: string): GameResult {
  if (g.isCheckmate()) {
    return g.turn() === player
      ? { outcome: 'loss', reason: 'checkmate', text: `Xeque-mate. O ${botName} venceu desta vez.` }
      : { outcome: 'win', reason: 'checkmate', text: `Xeque-mate! Você venceu o ${botName}!` };
  }
  if (g.isStalemate()) return { outcome: 'draw', reason: 'stalemate', text: 'Empate por afogamento.' };
  if (g.isInsufficientMaterial()) return { outcome: 'draw', reason: 'insufficient', text: 'Empate por falta de material.' };
  if (g.isThreefoldRepetition()) return { outcome: 'draw', reason: 'repetition', text: 'Empate por repetição de posição.' };
  return { outcome: 'draw', reason: 'draw', text: 'Empate.' };
}

function buildPgn(
  g: Chess,
  opts: { studentName: string; botName: string; color: Color; outcome: Outcome },
): string {
  const clean = (s: string) => s.replace(/["[\]\\]/g, '');
  const whiteWins = (opts.outcome === 'win') === (opts.color === 'w');
  const res = opts.outcome === 'draw' ? '1/2-1/2' : whiteWins ? '1-0' : '0-1';
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const student = clean(opts.studentName);
  const bot = clean(opts.botName);
  g.header(
    'Event', 'AL Chess Academy',
    'Site', 'AL Chess Academy',
    'Date', date,
    'White', opts.color === 'w' ? student : bot,
    'Black', opts.color === 'w' ? bot : student,
    'Result', res,
  );
  return g.pgn();
}

export const BotMatchViewer: React.FC<BotMatchViewerProps> = ({ content, assignment, onBack, onNext }) => {
  const {
    currentStudent,
    updateStudent,
    completeTask,
    saveGame,
    attachGameDiagnostics,
    isTeacherPreview,
    games,
  } = useApp();

  // Sem atividade atribuída (ou professor vendo como aluno) = prévia: nada é salvo.
  const previewMode = !assignment || isTeacherPreview;

  // Configuração vem da atividade, definida pelo professor
  const cfg = content.data ?? {};
  const startFen: string | undefined = isValidFen(cfg.startFen) ? cfg.startFen : undefined;
  const colorSetting: 'w' | 'b' | 'random' = cfg.playerColor === 'b' || cfg.playerColor === 'random' ? cfg.playerColor : 'w';
  const storageKey = !previewMode && assignment ? `al_chess_bot_${assignment.id}` : null;

  const gameRef = useRef(new Chess(startFen));
  const engineRef = useRef<StockfishClient | null>(null);
  const startedAtRef = useRef(Date.now());
  const elapsedBaseRef = useRef(0);
  const finishedOnceRef = useRef(false);
  const resumedRef = useRef(false);

  // Valores mais recentes, para uso dentro de callbacks e efeitos de execução única
  const studentRef = useRef(currentStudent);
  const colorRef = useRef<Color>('w');
  studentRef.current = currentStudent;

  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [phase, setPhase] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [levelId, setLevelId] = useState<BotLevelId>(getBotLevelId(content));
  const [playerColor, setPlayerColor] = useState<Color>(colorSetting === 'b' ? 'b' : 'w');

  const [fen, setFen] = useState(gameRef.current.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);

  const [diagStatus, setDiagStatus] = useState<'idle' | 'running' | 'done' | 'skipped' | 'error'>('idle');
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const level = BOT_LEVELS[levelId];
  const game = gameRef.current;

  // Se a partida desta atividade já foi registrada, o aluno só pode revê-la.
  const existingGame = !previewMode && assignment ? games.find((g) => g.assignmentId === assignment.id) : undefined;

  /* --- Ciclo de vida do Web Worker ---------------------------------- */
  useEffect(() => {
    const client = new StockfishClient();
    let disposed = false;
    client
      .init()
      .then(() => {
        if (disposed) return;
        engineRef.current = client;
        setEngineStatus('ready');
      })
      .catch(() => {
        if (!disposed) setEngineStatus('error');
      });
    return () => {
      disposed = true;
      engineRef.current = null;
      client.destroy();
    };
  }, []);

  /* --- Guardar a partida em andamento no aparelho ------------------- */
  const persistRef = useRef<(g: Chess) => void>(() => undefined);
  persistRef.current = (g: Chess) => {
    if (!storageKey) return;
    const elapsed = elapsedBaseRef.current + (Date.now() - startedAtRef.current) / 1000;
    const saved: SavedGame = { moves: g.history(), color: colorRef.current, elapsed };
    safeSet(storageKey, JSON.stringify(saved));
  };

  /* --- Aplicar lance ------------------------------------------------- */
  const commitMove = useCallback((m: { from: string; to: string; promotion?: string }) => {
    const g = gameRef.current;
    try {
      const mv = g.move({ from: m.from, to: m.to, promotion: m.promotion ?? 'q' });
      playSoundForMove(mv);
      setFen(g.fen());
      setMoves(g.history());
      setLastMove({ from: mv.from, to: mv.to });
      setSelected(null);
      persistRef.current(g);
      return true;
    } catch {
      return false;
    }
  }, []);

  /* --- Iniciar (ou retomar) a partida ------------------------------- */
  async function startGame(resume?: SavedGame) {
    const engine = engineRef.current;
    if (!engine) return;
    sounds.unlock(); // iOS: libera o áudio dentro do toque do usuário

    const color: Color = resume?.color ?? (colorSetting === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : colorSetting);
    colorRef.current = color;

    const g = new Chess(startFen);
    if (resume) {
      for (const san of resume.moves) {
        try {
          g.move(san);
        } catch {
          break;
        }
      }
    }
    gameRef.current = g;

    const hist = g.history({ verbose: true });
    const last = hist[hist.length - 1];
    setPlayerColor(color);
    setFen(g.fen());
    setMoves(g.history());
    setLastMove(last ? { from: last.from, to: last.to } : null);
    setSelected(null);

    elapsedBaseRef.current = resume?.elapsed ?? 0;
    startedAtRef.current = Date.now();

    await engine.newGame();
    engine.setOptions(
      level.uciElo
        ? { UCI_LimitStrength: true, UCI_Elo: level.uciElo }
        : { UCI_LimitStrength: false, 'Skill Level': level.skill },
    );

    persistRef.current(g);
    setPhase('playing');
  }

  /* --- Retomar partida salva (aluno saiu ou recarregou a página) ---- */
  useEffect(() => {
    if (engineStatus !== 'ready' || phase !== 'intro' || resumedRef.current || !storageKey || existingGame) return;
    const raw = safeGet(storageKey);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as SavedGame;
      if (Array.isArray(saved.moves) && (saved.color === 'w' || saved.color === 'b')) {
        resumedRef.current = true;
        startGame(saved);
      }
    } catch {
      safeRemove(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineStatus, phase]);

  /* --- Detecta fim de jogo ------------------------------------------- */
  useEffect(() => {
    if (phase !== 'playing') return;
    if (gameRef.current.isGameOver()) {
      setResult(describeResult(gameRef.current, playerColor, level.kidName));
      setPhase('finished');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, phase, playerColor]);

  /* --- Vez do bot ---------------------------------------------------- */
  useEffect(() => {
    if (phase !== 'playing' || engineStatus !== 'ready') return;
    const g = gameRef.current;
    const engine = engineRef.current;
    if (!engine || g.isGameOver() || g.turn() === playerColor) return;

    let cancelled = false;
    setThinking(true);

    (async () => {
      try {
        const started = Date.now();
        const legal = g.moves({ verbose: true });
        let uci: string;

        if (legal.length === 1 || Math.random() < level.blunderChance) {
          // Lance forçado, ou erro proposital (níveis iniciais)
          const pick = legal.length === 1 ? legal[0] : legal[Math.floor(Math.random() * legal.length)];
          uci = `${pick.from}${pick.to}${pick.promotion ?? ''}`;
        } else {
          const res = await engine.search(g.fen(), {
            depth: level.depth,
            movetime: thinkTime(level, g.history().length),
          });
          uci = res.bestmove;
        }

        const wait = level.minDelay - (Date.now() - started);
        if (wait > 0) await delay(wait);
        if (cancelled || uci === '(none)') return;
        commitMove({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      } catch {
        /* busca interrompida */
      }
    })();

    return () => {
      cancelled = true;
      engine.stop();
      setThinking(false);
    };
  }, [fen, phase, engineStatus, playerColor, level, commitMove]);

  /* --- Fim da partida: salvar, concluir a atividade e analisar -------- */
  useEffect(() => {
    if (phase !== 'finished' || !result || finishedOnceRef.current) return;
    finishedOnceRef.current = true;

    const g = gameRef.current;
    const history = g.history();
    const color = playerColor;
    const seconds = Math.round(elapsedBaseRef.current + (Date.now() - startedAtRef.current) / 1000);

    (async () => {
      let gameId: string | null = null;
      const student = studentRef.current;

      // 1) Registrar a partida e concluir a atividade (uma única vez)
      if (!previewMode && assignment && student) {
        setSaveStatus('saving');
        const pgn = buildPgn(g, {
          studentName: student.name,
          botName: level.kidName,
          color,
          outcome: result.outcome,
        });
        gameId = await saveGame({
          assignmentId: assignment.id,
          studentId: student.id,
          contentId: content.id,
          level: levelId,
          playerColor: color,
          result: result.outcome,
          reason: result.reason,
          startFen,
          moves: history,
          pgn,
          durationSeconds: seconds,
        });
        setSaveStatus(gameId ? 'saved' : 'error');
        completeTask(assignment.id, seconds, 1, result.outcome === 'win');
        if (storageKey) safeRemove(storageKey);
      }

      // 2) Diagnóstico pedagógico
      const engine = engineRef.current;
      if (history.length < 6 || !engine) {
        setDiagStatus('skipped');
        return;
      }
      setDiagStatus('running');
      try {
        const input = startFen ? { pgn: g.pgn(), playerColor: color } : { moves: history, playerColor: color };
        const rep = await analyzeGame(input, engine);
        setReport(rep);
        setDiagStatus('done');

        if (!previewMode && gameId) {
          const compact = { ...rep, blunders: rep.blunders.map(({ fenBefore, ...b }) => b) };
          attachGameDiagnostics(gameId, compact);
        }
        if (!previewMode && student && rep.weaknesses.length > 0) {
          updateStudent(student.id, {
            weaknesses: mergeWeaknesses(studentRef.current?.weaknesses, rep.weaknesses),
          });
        }
      } catch {
        setDiagStatus('error');
      }
    })();
    // Roda uma vez por partida. Incluir as funções do contexto reiniciaria a análise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result]);

  /* --- Ações --------------------------------------------------------- */
  const resign = () => {
    setConfirmResign(false);
    setResult({ outcome: 'loss', reason: 'resign', text: 'Você desistiu da partida.' });
    setPhase('finished');
  };

  const targets: string[] = selected ? game.moves({ square: selected, verbose: true }).map((m) => m.to) : [];

  const onSquareClick = (sq: string) => {
    if (phase !== 'playing' || game.turn() !== playerColor) return;
    if (selected && targets.includes(sq)) {
      commitMove({ from: selected, to: sq });
      return;
    }
    const piece = game.get(sq as Square);
    setSelected(piece && piece.color === playerColor ? (sq as Square) : null);
  };

  const LevelIcon = level.icon;
  const finish = () => (onNext ? onNext() : onBack());

  /* ================================================================== */
  /* Telas                                                               */
  /* ================================================================== */

  const backButton = (label = 'Voltar') => (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );

  // Atividade já feita: só revisão
  if (existingGame && phase === 'intro') {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4">
        {backButton()}
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> Você já jogou esta atividade. Aqui está a revisão da partida.
        </div>
        <GameReview
          moves={existingGame.moves}
          orientation={existingGame.playerColor}
          startFen={existingGame.startFen}
          blunders={existingGame.diagnostics?.blunders}
          summary={existingGame.diagnostics?.summary}
        />
      </div>
    );
  }

  if (phase === 'intro') {
    const colorText =
      colorSetting === 'random' ? 'A cor será sorteada.' : colorSetting === 'b' ? 'Você joga com as peças pretas.' : 'Você joga com as peças brancas.';
    const canStart = engineStatus === 'ready';

    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 sm:px-4">
        {backButton()}
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
            <LevelIcon className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{content.title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Adversário: {level.kidName}</p>
            {content.description && <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">{content.description}</p>}
          </div>

          <p className="text-sm font-bold text-slate-700">{colorText}</p>

          {!previewMode && (
            <p className="mx-auto flex max-w-md items-start gap-2 rounded-2xl bg-amber-50 p-3 text-left text-xs font-semibold text-amber-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Você joga esta partida uma única vez. Se sair no meio, ela continua de onde parou quando você voltar.
            </p>
          )}

          {previewMode && (
            <div className="space-y-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-left">
              <p className="text-xs font-bold text-amber-800">Prévia do professor: nada será salvo. Teste outro nível:</p>
              <div className="flex flex-wrap gap-2">
                {BOT_LEVEL_LIST.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevelId(l.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      l.id === levelId ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l.label} ({l.elo})
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => startGame()}
            disabled={!canStart}
            className="mx-auto flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 text-base font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {engineStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            {engineStatus === 'loading' ? 'Preparando o robô...' : 'Começar partida'}
          </button>

          {engineStatus === 'error' && (
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-600">
              <AlertTriangle className="h-4 w-4" /> Não foi possível carregar o robô. Recarregue a página.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    const myTurn = game.turn() === playerColor;
    return (
      <div className="mx-auto max-w-5xl space-y-3 px-3 py-4 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          {backButton('Sair')}
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
            <LevelIcon className="h-4 w-4 text-blue-600" />
            {level.kidName}
          </div>
        </div>

        <div
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black ${
            myTurn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {myTurn ? (
            'Sua vez!'
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {thinking ? `${level.kidName} está pensando...` : 'Aguarde...'}
            </>
          )}
        </div>

        <ChessBoard
          fen={fen}
          orientation={playerColor}
          selected={selected}
          targets={targets}
          lastMove={lastMove}
          checkSquare={getCheckSquare(fen)}
          onSquareClick={onSquareClick}
        />

        <div className="mx-auto flex max-w-[600px] items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500">
            {moves.length === 0 ? 'Nenhum lance ainda' : `${Math.ceil(moves.length / 2)} lance(s) • último: ${moves[moves.length - 1]}`}
          </span>

          {confirmResign ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Desistir?</span>
              <button
                type="button"
                onClick={resign}
                className="min-h-[40px] rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition active:scale-95"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setConfirmResign(false)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition active:scale-95"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmResign(true)}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 active:scale-95"
            >
              <Flag className="h-3.5 w-3.5" /> Desistir
            </button>
          )}
        </div>
      </div>
    );
  }

  // phase === 'finished'
  const blunders = report?.blunders.map((b) => ({
    ply: b.ply,
    san: b.san,
    category: b.category,
    cpLoss: b.cpLoss,
    bestReply: b.bestReply,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4">
      {backButton('Voltar às atividades')}
      <GameReview
        moves={moves}
        orientation={playerColor}
        startFen={startFen}
        blunders={blunders}
        result={result}
        summary={report?.summary}
        analyzing={diagStatus === 'running'}
        analysisFailed={diagStatus === 'error'}
      />

      {previewMode && (
        <p className="rounded-xl bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">Prévia do professor: esta partida não foi registrada.</p>
      )}
      {saveStatus === 'error' && (
        <p className="rounded-xl bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">
          Sua partida valeu, mas não conseguimos guardá-la no histórico agora. Avise o professor.
        </p>
      )}

      <button
        type="button"
        onClick={finish}
        disabled={saveStatus === 'saving'}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-base font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
      >
        {saveStatus === 'saving' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Salvando...
          </>
        ) : (
          'Concluir'
        )}
      </button>
    </div>
  );
};
