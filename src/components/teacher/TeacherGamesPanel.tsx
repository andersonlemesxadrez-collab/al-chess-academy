import React, { useEffect, useState } from 'react';
import { Bot, Brain, Copy, Download, Eye, FileText, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameReview } from '../student/GameReview';
import { BOT_LEVEL_LIST, getBotLevel, getBotLevelId } from '../../utils/botLevels';
import type { ContentItem, GameRecord } from '../../types/chess';

const RESULT_LABEL: Record<GameRecord['result'], { text: string; className: string }> = {
  win: { text: 'Vitória do aluno', className: 'bg-emerald-50 text-emerald-700' },
  loss: { text: 'Derrota do aluno', className: 'bg-rose-50 text-rose-700' },
  draw: { text: 'Empate', className: 'bg-slate-100 text-slate-700' },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m} min ${seconds % 60}s` : `${seconds}s`;
};

/* ---------- Modal genérico ---------- */
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
    <div className="my-4 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-slate-900 sm:text-lg">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/* ---------- Modal do PGN (somente professor) ---------- */
const PgnModal: React.FC<{ game: GameRecord; title: string; onClose: () => void }> = ({ game, title, onClose }) => {
  const { fetchGamePgn } = useApp();
  const [pgn, setPgn] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchGamePgn(game.id).then((p) => {
      if (alive) setPgn(p);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  const copy = async () => {
    if (!pgn) return;
    try {
      await navigator.clipboard.writeText(pgn);
    } catch {
      const el = document.getElementById('pgn-textarea') as HTMLTextAreaElement | null;
      el?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    if (!pgn) return;
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w-]+/g, '_')}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="PGN da partida" onClose={onClose}>
      {pgn === undefined && (
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </p>
      )}
      {pgn === null && <p className="text-sm font-medium text-rose-600">Não foi possível carregar o PGN desta partida.</p>}
      {pgn && (
        <div className="space-y-3">
          <textarea
            id="pgn-textarea"
            readOnly
            value={pgn}
            rows={10}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-base outline-none sm:text-xs"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <Copy className="h-4 w-4" /> {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={download}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95"
            >
              <Download className="h-4 w-4" /> Baixar .pgn
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ---------- Painel principal ---------- */
export const TeacherGamesPanel: React.FC = () => {
  const { students, contents, games, updateContent } = useApp();

  const [studentFilter, setStudentFilter] = useState('all');
  const [reviewGame, setReviewGame] = useState<GameRecord | null>(null);
  const [pgnGame, setPgnGame] = useState<GameRecord | null>(null);

  const botContents = contents.filter((c) => c.type === 'bot_match');
  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Aluno removido';
  const contentTitle = (id?: string) => contents.find((c) => c.id === id)?.title ?? 'Atividade removida';

  const visibleGames = games.filter((g) => studentFilter === 'all' || g.studentId === studentFilter);
  const studentsWithWeaknesses = students.filter((s) => (s.weaknesses?.length ?? 0) > 0);

  const setBotConfig = (c: ContentItem, patch: Record<string, unknown>) => {
    updateContent(c.id, { data: { ...(c.data ?? {}), ...patch } });
  };

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base font-semibold text-slate-800 outline-none focus:border-blue-500 sm:text-sm';

  return (
    <div className="space-y-6">
      {/* 1) Nível do bot em cada atividade */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nível do bot em cada atividade</h2>
            <p className="text-xs text-slate-500">
              O aluno joga obrigatoriamente contra o nível definido aqui e não vê nenhuma opção para mudá-lo. Ele só enxerga o nome amigável do robô.
            </p>
          </div>
        </div>

        {botContents.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500">
            Ainda não há atividades do tipo "partida contra o bot". Crie uma em "Criar Atividade".
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {botContents.map((c) => {
              const lvl = getBotLevel(getBotLevelId(c));
              return (
                <div key={c.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500">Aluno vê: {lvl.kidName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nível do bot</span>
                      <select value={getBotLevelId(c)} onChange={(e) => setBotConfig(c, { botLevel: e.target.value })} className={selectClass}>
                        {BOT_LEVEL_LIST.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label} (Elo {l.elo})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Cor do aluno</span>
                      <select
                        value={c.data?.playerColor === 'b' || c.data?.playerColor === 'random' ? c.data.playerColor : 'w'}
                        onChange={(e) => setBotConfig(c, { playerColor: e.target.value })}
                        className={selectClass}
                      >
                        <option value="w">Brancas</option>
                        <option value="b">Pretas</option>
                        <option value="random">Sorteio</option>
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2) Pontos fracos por aluno */}
      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">Pontos fracos detectados</h2>
        </div>
        {studentsWithWeaknesses.length === 0 ? (
          <p className="text-xs font-medium text-slate-500">Nenhum ponto fraco registrado ainda. Eles aparecem depois que os alunos terminam partidas contra o bot.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {studentsWithWeaknesses.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 p-3">
                <p className="mb-2 text-sm font-bold text-slate-800">{s.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.weaknesses!.map((w) => (
                    <span key={w} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3) Partidas dos alunos */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Partidas dos alunos</h2>
            <p className="text-xs text-slate-500">Somente o professor tem acesso ao PGN.</p>
          </div>
          <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className={`${selectClass} sm:max-w-[220px]`}>
            <option value="all">Todos os alunos</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {visibleGames.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-medium text-slate-500">Nenhuma partida registrada.</p>
        ) : (
          <div className="space-y-2">
            {visibleGames.map((g) => {
              const lvl = getBotLevel(g.level);
              const found: string[] = g.diagnostics?.weaknesses ?? [];
              return (
                <div key={g.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{studentName(g.studentId)}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${RESULT_LABEL[g.result].className}`}>{RESULT_LABEL[g.result].text}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {contentTitle(g.contentId)} • {lvl.label} (Elo {lvl.elo}) • {g.moves.length} lances • {formatDuration(g.durationSeconds)} • {formatDateTime(g.finishedAt)}
                    </p>
                    {found.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {found.map((w) => (
                          <span key={w} className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewGame(g)}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                    >
                      <Eye className="h-4 w-4" /> Rever
                    </button>
                    <button
                      type="button"
                      onClick={() => setPgnGame(g)}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95"
                    >
                      <FileText className="h-4 w-4" /> PGN
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {reviewGame && (
        <Modal title={`${studentName(reviewGame.studentId)} • ${contentTitle(reviewGame.contentId)}`} onClose={() => setReviewGame(null)}>
          <GameReview
            moves={reviewGame.moves}
            orientation={reviewGame.playerColor}
            startFen={reviewGame.startFen}
            blunders={reviewGame.diagnostics?.blunders}
            summary={reviewGame.diagnostics?.summary}
            result={{ outcome: reviewGame.result, text: RESULT_LABEL[reviewGame.result].text }}
          />
        </Modal>
      )}

      {pgnGame && <PgnModal game={pgnGame} title={`${studentName(pgnGame.studentId)}_${contentTitle(pgnGame.contentId)}`} onClose={() => setPgnGame(null)} />}
    </div>
  );
};
