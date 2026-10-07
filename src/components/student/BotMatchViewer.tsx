import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';
import {
  Activity, AlertTriangle, Bot, Brain, Crown, Flag,
  Loader2, RotateCcw, Swords, Target, Trophy, Zap, X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockfishClient } from '../../utils/stockfishClient';
import { analyzeGame, mergeWeaknesses } from '../../utils/aiDiagnostics';
import type { DiagnosticReport } from '../../utils/aiDiagnostics';

type LevelId = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'superhuman';

interface BotLevel {
  id: LevelId;
  label: string;
  elo: string;
  description: string;
  icon: LucideIcon;
  skill: number;
  depth: number;
  movetime: number;
  blunderChance: number;
}

const LEVELS: Record<LevelId, BotLevel> = {
  beginner: {
    id: 'beginner', label: 'Iniciante', elo: '~1000', icon: Bot,
    description: 'Joga rápido e comete erros propositais. Ótimo para pegar confiança.',
    skill: 1, depth: 2, movetime: 150, blunderChance: 0.2,
  },
  intermediate: {
    id: 'intermediate', label: 'Intermediário', elo: '~1600', icon: Target,
    description: 'Partidas sólidas, com pouco espaço para lances ingênuos.',
    skill: 8, depth: 6, movetime: 400, blunderChance: 0.04,
  },
  advanced: {
    id: 'advanced', label: 'Avançado', elo: '~2200', icon: Activity,
    description: 'Pune erros táticos e converte vantagens pequenas.',
    skill: 14, depth: 10, movetime: 1000, blunderChance: 0,
  },
  master: {
    id: 'master', label: 'Mestre', elo: '~2600', icon: Crown,
    description: 'Jogo posicional e tático quase perfeito.',
    skill: 18, depth: 14, movetime: 2000, blunderChance: 0,
  },
  superhuman: {
    id: 'superhuman', label: 'Super-Humano', elo: '3500+', icon: Zap,
    description: 'Stockfish sem restrições. Imbatível, nível superior a um Grande Mestre.',
    skill: 20, depth: 24, movetime: 5000, blunderChance: 0,
  },
};
const LEVEL_LIST = Object.values(LEVELS);

const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function findKing(game: Chess, color: Color): Square | null {
  for (const row of game.board()) {
    for (const cell of row) if (cell && cell.type === 'k' && cell.color === color) return cell.square;
  }
  return null;
}

function Board({ game, orientation, selected, targets, lastMove, onSquareClick }: any) {
  const files = orientation === 'w' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();
  const checkSq = game.inCheck() ? findKing(game, game.turn()) : null;

  return (
    <div className="mx-auto grid aspect-square w-full max-w-[600px] select-none grid-cols-8 overflow-hidden rounded-lg border border-slate-700 shadow-xl">
      {ranks.flatMap((r, ri) =>
        files.map((f, fi) => {
          const sq = `${f}${r}` as Square;
          const dark = (FILES.indexOf(f) + Number(r)) % 2 === 1;
          const piece = game.get(sq);
          const isTarget = targets.includes(sq);
          return (
            <button
              key={sq}
              type="button"
              onClick={() => onSquareClick(sq)}
              className={`relative flex aspect-square items-center justify-center ${dark ? 'bg-slate-500' : 'bg-slate-300'} ${
                selected === sq ? 'ring-4 ring-inset ring-blue-500' : ''
              }`}
            >
              {(lastMove?.from === sq || lastMove?.to === sq) && <span className="absolute inset-0 bg-amber-500/35" />}
              {checkSq === sq && <span className="absolute inset-0 bg-red-500/55" />}
              {piece && (
                <span className={`relative z-10 text-[clamp(1.6rem,8.5vw,3.3rem)] leading-none ${piece.color === 'w' ? 'text-white' : 'text-slate-900'}`}>
                  {GLYPH[piece.type]}
                </span>
              )}
              {isTarget && !piece && <span className="absolute z-10 h-1/4 w-1/4 rounded-full bg-blue-500/70" />}
            </button>
          );
        }),
      )}
    </div>
  );
}

interface GameResult {
  outcome: 'win' | 'loss' | 'draw';
  text: string;
}

function describeResult(g: Chess, player: Color): GameResult {
  if (g.isCheckmate()) {
    return g.turn() === player
      ? { outcome: 'loss', text: 'Xeque-mate. A IA venceu.' }
      : { outcome: 'win', text: 'Incrível! Você venceu a IA!' };
  }
  if (g.isDraw()) return { outcome: 'draw', text: 'Empate.' };
  return { outcome: 'draw', text: 'Fim de jogo.' };
}

export const BotMatchViewer = ({ onBack }: { onBack: () => void }) => {
  const { currentStudent, updateStudent } = useApp();

  const gameRef = useRef(new Chess());
  const engineRef = useRef<StockfishClient | null>(null);

  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [levelId, setLevelId] = useState<LevelId>('intermediate');
  const [playerColor, setPlayerColor] = useState<Color>('w');

  const [fen, setFen] = useState(gameRef.current.fen());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const [diagStatus, setDiagStatus] = useState<'idle' | 'running' | 'done' | 'skipped' | 'error'>('idle');
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const level = LEVELS[levelId];
  const game = gameRef.current;

  useEffect(() => {
    const client = new StockfishClient('/stockfish.js');
    client.init().then(() => {
      engineRef.current = client;
      setEngineStatus('ready');
    }).catch(() => setEngineStatus('error'));

    return () => client.destroy();
  }, []);

  const commitMove = useCallback((m: { from: string; to: string; promotion?: string }) => {
    const g = gameRef.current;
    try {
      const mv = g.move({ from: m.from, to: m.to, promotion: m.promotion ?? 'q' });
      setFen(g.fen());
      setLastMove({ from: mv.from, to: mv.to });
      setSelected(null);
      return true;
    } catch { return false; }
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (gameRef.current.isGameOver()) {
      setResult(describeResult(gameRef.current, playerColor));
      setPhase('finished');
    }
  }, [fen, phase, playerColor]);

  useEffect(() => {
    if (phase !== 'playing' || engineStatus !== 'ready') return;
    const g = gameRef.current;
    const engine = engineRef.current;
    if (!engine || g.isGameOver() || g.turn() === playerColor) return;

    setThinking(true);
    let cancelled = false;

    (async () => {
      try {
        let uci: string;
        if (Math.random() < level.blunderChance) {
          const legal = g.moves({ verbose: true });
          const pick = legal[Math.floor(Math.random() * legal.length)];
          uci = `${pick.from}${pick.to}${pick.promotion ?? ''}`;
        } else {
          const res = await engine.search(g.fen(), { depth: level.depth, movetime: level.movetime });
          uci = res.bestmove;
        }

        if (cancelled || uci === '(none)') return;
        commitMove({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      } catch {}
    })();

    return () => { cancelled = true; engine.stop(); setThinking(false); };
  }, [fen, phase, engineStatus, playerColor, level, commitMove]);

  useEffect(() => {
    if (phase !== 'finished') return;
    const engine = engineRef.current;
    const history = gameRef.current.history();
    if (!engine || history.length < 6 || !currentStudent) {
      setDiagStatus('skipped');
      return;
    }

    const ctrl = new AbortController();
    setDiagStatus('running');

    (async () => {
      try {
        const rep = await analyzeGame({ moves: history, playerColor }, engine, { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        setReport(rep);
        
        if (rep.weaknesses.length > 0) {
          updateStudent(currentStudent.id, { 
            weaknesses: mergeWeaknesses(currentStudent.weaknesses, rep.weaknesses),
            xp: currentStudent.xp + 50
          });
        }
        setDiagStatus('done');
      } catch {
        if (!ctrl.signal.aborted) setDiagStatus('error');
      }
    })();

    return () => ctrl.abort();
  }, [phase, currentStudent, playerColor, updateStudent]);

  const startGame = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setLastMove(null);
    setSelected(null);
    setReport(null);
    setDiagStatus('idle');
    await engine.newGame();
    engine.setOptions({ 'Skill Level': level.skill, UCI_LimitStrength: false });
    setPhase('playing');
  };

  const targets: Square[] = selected ? game.moves({ square: selected, verbose: true }).map((m) => m.to) : [];

  const onSquareClick = (sq: Square) => {
    if (phase !== 'playing' || game.turn() !== playerColor) return;
    if (selected && targets.includes(sq)) { commitMove({ from: selected, to: sq }); return; }
    const piece = game.get(sq);
    setSelected(piece && piece.color === playerColor ? sq : null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black text-slate-900">Treinamento com IA</h2>
        </div>
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {phase === 'setup' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-medium text-center">
            Escolha a dificuldade. Ao final, a IA analisa seus lances e registra os seus pontos fracos para o professor.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LEVEL_LIST.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevelId(l.id)}
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors ${
                  l.id === levelId ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <l.icon className={`h-6 w-6 ${l.id === 'superhuman' ? 'text-amber-500' : 'text-blue-500'}`} />
                <div>
                  <p className="font-bold text-slate-800">{l.label}</p>
                  <p className="text-xs font-bold text-slate-500">Elo {l.elo}</p>
                </div>
                <p className="text-xs text-slate-500 leading-tight">{l.description}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
             <div className="flex gap-2">
              <button onClick={() => setPlayerColor('w')} className={`px-4 py-2 rounded-xl text-sm font-bold ${playerColor === 'w' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Brancas</button>
              <button onClick={() => setPlayerColor('b')} className={`px-4 py-2 rounded-xl text-sm font-bold ${playerColor === 'b' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Pretas</button>
            </div>
            
            <button
              onClick={startGame}
              disabled={engineStatus !== 'ready'}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {engineStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Swords className="h-5 w-5" />}
              {engineStatus === 'loading' ? 'Carregando Motor...' : 'Começar Partida'}
            </button>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          <Board game={game} orientation={playerColor} selected={selected} targets={targets} lastMove={lastMove} onSquareClick={onSquareClick} />
          <div className="w-full lg:w-64 space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <level.icon className="w-5 h-5 text-blue-500" /> IA ({level.label})
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-bold">Elo: {level.elo}</p>
              {thinking && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> A IA está pensando...</p>}
            </div>
            <button onClick={() => { setResult({ outcome: 'loss', text: 'Você abandonou.' }); setPhase('finished'); }} className="w-full py-2.5 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition">
              Abandonar Partida
            </button>
          </div>
        </div>
      )}

      {phase === 'finished' && result && (
        <div className="py-6 space-y-6 max-w-2xl mx-auto">
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${result.outcome === 'win' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <Trophy className={`w-6 h-6 ${result.outcome === 'win' ? 'text-emerald-500' : 'text-slate-400'}`} />
            <h3 className="font-bold text-lg">{result.text}</h3>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <h4 className="font-black text-amber-900 flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5" /> Diagnóstico da IA
            </h4>
            
            {diagStatus === 'running' && <p className="text-amber-700 font-medium flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Analisando seus erros e acertos...</p>}
            {diagStatus === 'skipped' && <p className="text-amber-700 font-medium">A partida foi curta demais para um diagnóstico preciso.</p>}
            
            {diagStatus === 'done' && report && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-amber-800 leading-relaxed">{report.summary}</p>
                {report.weaknesses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {report.weaknesses.map(w => <span key={w} className="bg-white border border-amber-300 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold">{w}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button onClick={() => setPhase('setup')} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
            Jogar Novamente
          </button>
        </div>
      )}
    </div>
  );
};