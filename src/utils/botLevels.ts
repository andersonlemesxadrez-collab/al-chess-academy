import { Activity, Bot, Crown, Target, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentItem } from '../types/chess';

export type BotLevelId = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'superhuman';

export interface BotLevel {
  id: BotLevelId;
  /** Nome técnico, mostrado ao professor. */
  label: string;
  /** Nome amigável, mostrado ao aluno (sem Elo). */
  kidName: string;
  /** Elo aproximado, mostrado só ao professor. */
  elo: string;
  description: string;
  icon: LucideIcon;
  /** setoption name Skill Level value X (0–20). Usado quando não há uciElo. */
  skill: number;
  /** go depth Y */
  depth: number;
  /** Teto de tempo por lance (ms). */
  movetime: number;
  /** Chance de jogar um lance aleatório de propósito. */
  blunderChance: number;
  /** Espera mínima antes de jogar, para o lance não parecer instantâneo (ms). */
  minDelay: number;
  /** Elo para UCI_LimitStrength (1320–3190). Omitir = usa Skill Level. */
  uciElo?: number;
}

export const BOT_LEVELS: Record<BotLevelId, BotLevel> = {
  beginner: {
    id: 'beginner', label: 'Iniciante', kidName: 'Robô Aprendiz', elo: '~1000', icon: Bot,
    description: 'Joga rápido e comete erros propositais.',
    skill: 1, depth: 2, movetime: 150, blunderChance: 0.2, minDelay: 600,
  },
  intermediate: {
    id: 'intermediate', label: 'Intermediário', kidName: 'Robô Esperto', elo: '~1600', icon: Target,
    description: 'Partidas sólidas, com pouco espaço para lances ingênuos.',
    skill: 8, depth: 6, movetime: 400, blunderChance: 0.04, minDelay: 500, uciElo: 1600,
  },
  advanced: {
    id: 'advanced', label: 'Avançado', kidName: 'Robô Estrategista', elo: '~2200', icon: Activity,
    description: 'Pune erros táticos e converte vantagens pequenas.',
    skill: 14, depth: 10, movetime: 700, blunderChance: 0, minDelay: 300, uciElo: 2200,
  },
  master: {
    id: 'master', label: 'Mestre', kidName: 'Robô Mestre', elo: '~2600', icon: Crown,
    description: 'Jogo posicional e tático quase perfeito.',
    skill: 18, depth: 14, movetime: 1200, blunderChance: 0, minDelay: 0, uciElo: 2600,
  },
  superhuman: {
    id: 'superhuman', label: 'Super-Humano', kidName: 'Super-Robô', elo: '3200+', icon: Zap,
    description: 'Motor sem restrições. Nível superior a um Grande Mestre.',
    skill: 20, depth: 24, movetime: 2500, blunderChance: 0, minDelay: 0,
  },
};

export const BOT_LEVEL_LIST: BotLevel[] = Object.values(BOT_LEVELS);
export const DEFAULT_BOT_LEVEL: BotLevelId = 'intermediate';

/** Lê o nível definido pelo professor na atividade (content.data.botLevel). */
export function getBotLevelId(content?: ContentItem | null): BotLevelId {
  const raw = content?.data?.botLevel;
  return typeof raw === 'string' && raw in BOT_LEVELS ? (raw as BotLevelId) : DEFAULT_BOT_LEVEL;
}

export function getBotLevel(key?: string | null): BotLevel {
  return key && key in BOT_LEVELS ? BOT_LEVELS[key as BotLevelId] : BOT_LEVELS[DEFAULT_BOT_LEVEL];
}

/** Tempo de reflexão: curto na abertura, cheio no resto. */
export function thinkTime(level: BotLevel, plies: number): number {
  return plies < 10 ? Math.min(level.movetime, 400) : level.movetime;
}
