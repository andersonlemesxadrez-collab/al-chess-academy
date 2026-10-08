import React, { useState } from 'react';
import { BotMatchViewer } from './BotMatchViewer';
import { PieceCaptureViewer } from './PieceCaptureViewer';
import { PawnBattleViewer } from './PawnBattleViewer';
import { useApp } from '../../context/AppContext';
import { ContentItem, GameRecord, TaskAssignment } from '../../types/chess';
import { AvatarBadge } from './AvatarBadge';
import { PuzzleSolver } from './PuzzleSolver';
import { GameViewer } from './GameViewer';
import { LessonViewer } from './LessonViewer';
import { GameAnalysisViewer } from './GameAnalysisViewer';
import { GameReview } from './GameReview';
import { VectorShopModal } from './VectorShopModal';
import { getBotLevel, getBotLevelId } from '../../utils/botLevels';
import {
  Flame,
  Award,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  History as HistoryIcon,
  Swords,
  Trophy,
  Shield,
  Star,
  Palette,
  ShoppingBag,
  User,
  Target,
} from 'lucide-react';

type Tab = 'activities' | 'history' | 'profile';

const TYPE_LABEL: Record<string, string> = {
  puzzle: 'Quebra-cabeça',
  game: 'Partida comentada',
  lesson: 'Lição',
  analysis: 'Análise',
  bot_match: 'Jogo contra o robô',
  piece_capture: 'Captura de peças',
  pawn_battle: 'Batalha de peões',
};

const RESULT_LABEL: Record<GameRecord['result'], { text: string; className: string }> = {
  win: { text: 'Vitória', className: 'bg-emerald-50 text-emerald-700' },
  loss: { text: 'Derrota', className: 'bg-rose-50 text-rose-700' },
  draw: { text: 'Empate', className: 'bg-slate-100 text-slate-700' },
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s}s` : `${s}s`;
};

export const StudentDashboard: React.FC = () => {
  const { currentStudent, assignments, contents, achievements, games } = useApp();

  const [activeTask, setActiveTask] = useState<{ content: ContentItem; assignment?: TaskAssignment } | null>(null);
  const [tab, setTab] = useState<Tab>('activities');
  const [historyItem, setHistoryItem] = useState<{ content: ContentItem; assignment: TaskAssignment } | null>(null);

  const [showVectorShop, setShowVectorShop] = useState(false);
  const [shopTab, setShopTab] = useState<'shop' | 'wardrobe' | 'colors'>('shop');
  const openShop = (t: 'shop' | 'wardrobe' | 'colors') => {
    setShopTab(t);
    setShowVectorShop(true);
  };

  if (!currentStudent) {
    return <div className="p-8 text-center font-medium text-slate-500">Nenhum aluno selecionado.</div>;
  }

  // Encaminhamento para os visualizadores de atividade (somente atividades abertas)
  if (activeTask) {
    const close = () => setActiveTask(null);
    const { content, assignment } = activeTask;
    // A partida contra o bot tem os próprios botões de voltar em todas as fases.
    if (content.type === 'bot_match') return <BotMatchViewer content={content} assignment={assignment} onBack={close} onNext={close} />;

    let viewer: React.ReactNode = null;
    if (content.type === 'piece_capture') viewer = <PieceCaptureViewer content={content} assignment={assignment} onBack={close} onNext={close} />;
    else if (content.type === 'pawn_battle') viewer = <PawnBattleViewer content={content} assignment={assignment} onBack={close} onNext={close} />;
    else if (content.type === 'puzzle') viewer = <PuzzleSolver content={content} assignment={assignment} onBack={close} onNext={close} />;
    else if (content.type === 'game') viewer = <GameViewer content={content} assignment={assignment} onBack={close} />;
    else if (content.type === 'lesson') viewer = <LessonViewer content={content} assignment={assignment} onBack={close} />;
    else if (content.type === 'analysis') viewer = <GameAnalysisViewer content={content} assignment={assignment} onBack={close} />;

    // Todas as outras atividades ganham um botão de voltar fixo no topo.
    if (viewer) {
      return (
        <div>
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <button
              type="button"
              onClick={close}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar às atividades
            </button>
          </div>
          {viewer}
        </div>
      );
    }
  }

  const studentAssignments = assignments.filter((a) => a.studentId === currentStudent.id);
  const pendingAssignments = studentAssignments.filter((a) => a.status === 'pending');
  const completedAssignments = studentAssignments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  const myGames = games.filter((g) => g.studentId === currentStudent.id);
  const nextRankXp = (currentStudent.levelRank ?? 1) * 350;
  const xp = currentStudent.xp ?? 0;
  const currentLevelProgress = Math.min(100, Math.round((xp / nextRankXp) * 100));
  const isKids = currentStudent.kidsMode;

  const backToActivities = (
    <button
      type="button"
      onClick={() => setTab('activities')}
      className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      <ArrowLeft className="h-4 w-4" /> Voltar às atividades
    </button>
  );

  const tabButton = (id: Tab, label: string, icon: React.ReactNode, count?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setTab(id);
        setHistoryItem(null);
      }}
      aria-current={tab === id ? 'page' : undefined}
      className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition active:scale-95 sm:flex-none sm:px-5 sm:text-sm ${
        tab === id ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`rounded-full px-1.5 text-[10px] font-black ${tab === id ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'}`}>{count}</span>
      )}
    </button>
  );

  /* ------------------------------------------------------------------ */
  /* Aba: Atividades (foco no xadrez, só o que está aberto)              */
  /* ------------------------------------------------------------------ */
  const activitiesTab = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">Suas atividades</h2>
          <p className="text-xs font-medium text-slate-500">Cada atividade pode ser feita uma única vez.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {pendingAssignments.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-6 py-12 text-center sm:p-8">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-800">Nenhuma atividade por agora</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs font-medium text-slate-500">
              Quando o professor liberar uma nova atividade, ela aparece aqui. Enquanto isso, veja o que você já fez.
            </p>
            <button
              type="button"
              onClick={() => setTab('history')}
              className="mt-5 min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
            >
              Ver meu histórico
            </button>
          </div>
        ) : (
          pendingAssignments.map((assignment) => {
            const content = contents.find((c) => c.id === assignment.contentId);
            if (!content) return null;
            const isBot = content.type === 'bot_match';

            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => setActiveTask({ content, assignment })}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-400 hover:shadow-md active:scale-[0.98]"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {TYPE_LABEL[content.type] ?? content.category ?? content.type}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < (content.difficulty ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-bold leading-tight text-slate-900 transition group-hover:text-blue-600">{content.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs font-medium text-slate-500">{content.description}</p>
                  {isBot && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Swords className="h-3.5 w-3.5 text-blue-500" />
                      Adversário: {getBotLevel(getBotLevelId(content)).kidName}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Award className="h-4 w-4" />
                    <span>+{content.xpReward ?? 0} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 transition group-hover:translate-x-1">
                    <span>Iniciar</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Aba: Histórico                                                      */
  /* ------------------------------------------------------------------ */
  const renderHistoryDetail = () => {
    if (!historyItem) return null;
    const { content, assignment } = historyItem;
    const game = myGames.find((g) => g.assignmentId === assignment.id);

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setHistoryItem(null)}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao histórico
        </button>

        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">{content.title}</h2>
          <p className="text-xs font-medium text-slate-500">
            {TYPE_LABEL[content.type] ?? content.type} • concluída em {formatDate(assignment.completedAt)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <div className="text-lg font-black text-slate-900">{assignment.score ?? '—'}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pontos</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <div className="text-lg font-black text-slate-900">{formatDuration(game?.durationSeconds ?? assignment.timeSpentSeconds)}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tempo</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <div className="text-lg font-black text-slate-900">+{content.xpReward ?? 0}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">XP</div>
          </div>
        </div>

        {game ? (
          <GameReview
            moves={game.moves}
            orientation={game.playerColor}
            startFen={game.startFen}
            blunders={game.diagnostics?.blunders}
            summary={game.diagnostics?.summary}
            result={{
              outcome: game.result,
              text:
                game.result === 'win' ? 'Você venceu esta partida!' : game.result === 'loss' ? 'Você perdeu esta partida.' : 'A partida terminou empatada.',
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
            {content.type === 'bot_match'
              ? 'Os lances desta partida não foram guardados.'
              : `Você concluiu esta atividade${assignment.firstTrySuccess ? ' de primeira' : ''}${
                  assignment.attempts ? ` em ${assignment.attempts} tentativa(s)` : ''
                }.`}
          </div>
        )}
      </div>
    );
  };

  const historyTab = historyItem ? (
    renderHistoryDetail()
  ) : (
    <div className="space-y-4">
      {backToActivities}
      <div>
        <h2 className="text-lg font-black text-slate-900 sm:text-xl">Histórico</h2>
        <p className="text-xs font-medium text-slate-500">Veja o que você já fez e reveja suas partidas.</p>
      </div>

      {completedAssignments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 py-12 text-center text-xs font-medium text-slate-500">
          Você ainda não concluiu nenhuma atividade.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {completedAssignments.map((assignment) => {
            const content = contents.find((c) => c.id === assignment.contentId);
            if (!content) return null;
            const game = myGames.find((g) => g.assignmentId === assignment.id);

            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => setHistoryItem({ content, assignment })}
                className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white/90 p-5 text-left transition hover:shadow-sm active:scale-[0.98]"
              >
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluída
                    </span>
                    {game && (
                      <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${RESULT_LABEL[game.result].className}`}>
                        {RESULT_LABEL[game.result].text}
                      </span>
                    )}
                    {!game && assignment.firstTrySuccess && (
                      <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">🎯 De primeira</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold leading-tight text-slate-800">{content.title}</h3>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">
                    {TYPE_LABEL[content.type] ?? content.type} • {formatDate(assignment.completedAt)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-blue-600">
                  <span>{game ? 'Rever partida' : 'Ver detalhes'}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Aba: Perfil (avatar, patente, recompensas e conquistas)             */
  /* ------------------------------------------------------------------ */
  const profileTab = (
    <div className="space-y-6">
      {backToActivities}
      <div
        className={`rounded-3xl p-5 shadow-sm transition-all duration-300 sm:p-8 ${
          isKids
            ? 'border-2 border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/15'
            : 'border border-slate-200 bg-white'
        }`}
      >
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:text-left">
            <div className="flex shrink-0 flex-col items-center">
              <AvatarBadge student={currentStudent} size="xl" />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openShop('wardrobe')}
                  className="flex min-h-[40px] items-center gap-1 rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-white active:scale-95"
                >
                  <Palette className="h-3.5 w-3.5 text-blue-600" />
                  <span>Personalizar Avatar</span>
                </button>
                <button
                  type="button"
                  onClick={() => openShop('shop')}
                  className="flex min-h-[40px] items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                  <span>Loja XP</span>
                </button>
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">{currentStudent.name}</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800 shadow-sm">
                  Nível {currentStudent.level}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-600">
                Patente: <strong className="font-bold text-blue-600">{currentStudent.rankName}</strong> (Nível {currentStudent.levelRank})
              </p>
              {currentStudent.notes && (
                <p className="mt-2.5 text-xs font-medium italic text-slate-500">&ldquo;{currentStudent.notes}&rdquo;</p>
              )}
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-3 gap-2 sm:gap-3 md:w-auto">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white px-2 py-3 text-center sm:px-4 md:min-w-[96px]">
              <div className="flex items-center gap-1 text-lg font-extrabold text-amber-500 sm:text-xl">
                <Flame className="h-5 w-5 fill-amber-400 text-amber-500" />
                <span>{currentStudent.streak}</span>
              </div>
              <span className="mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">Dias Seguidos</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-200 bg-white px-2 py-3 text-center sm:px-4 md:min-w-[96px]">
              <div className="flex items-center gap-1 text-lg font-extrabold text-blue-600 sm:text-xl">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>{currentStudent.streakShields ?? 0}</span>
              </div>
              <span className="mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">Escudo</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white px-2 py-3 text-center sm:px-4 md:min-w-[96px]">
              <div className="flex items-center gap-1 text-lg font-extrabold sm:text-xl">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="text-slate-900">{xp}</span>
              </div>
              <span className="mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">Pontos XP</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200/60 pt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
            <span>Progresso para o próximo nível</span>
            <span className="font-extrabold text-blue-600">
              {xp} / {nextRankXp} XP ({currentLevelProgress}%)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 transition-all duration-500"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Quadro de Conquistas</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Desbloqueia ao subir de nível e resolver desafios</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {achievements.map((ach, idx) => {
            const isUnlocked = idx < (currentStudent.levelRank ?? 1);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                  isUnlocked ? 'cursor-default border border-amber-200/80 bg-amber-50/60 shadow-sm' : 'border border-slate-200 bg-slate-50 opacity-50 grayscale'
                }`}
              >
                <span className="mb-2 text-3xl sm:text-4xl">{ach.icon}</span>
                <span className="line-clamp-1 text-xs font-bold text-slate-800">{ach.title}</span>
                <p className="mt-1 line-clamp-2 text-[10px] font-medium text-slate-500">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:py-8">
      {/* Cabeçalho enxuto: o foco da tela principal é o xadrez */}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setTab('profile')} className="flex min-w-0 items-center gap-3 text-left" aria-label="Abrir meu perfil">
          <AvatarBadge student={currentStudent} size="md" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Olá,</p>
            <p className="truncate text-lg font-black leading-tight text-slate-900">{currentStudent.name}</p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            {currentStudent.streak}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            {xp} XP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" role="tablist" aria-label="Seções">
        {tabButton('activities', 'Atividades', <Target className="h-4 w-4" />, pendingAssignments.length)}
        {tabButton('history', 'Histórico', <HistoryIcon className="h-4 w-4" />)}
        {tabButton('profile', 'Perfil', <User className="h-4 w-4" />)}
      </div>

      {tab === 'activities' && activitiesTab}
      {tab === 'history' && historyTab}
      {tab === 'profile' && profileTab}

      {showVectorShop && <VectorShopModal initialTab={shopTab} onClose={() => setShowVectorShop(false)} />}
    </div>
  );
};
