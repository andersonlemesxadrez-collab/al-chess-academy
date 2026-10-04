export type UserRole = 'student' | 'teacher';

export type ActivityLogEntry = {
  id: string;
  studentId?: string;
  action: string;
  title?: string;
  details?: string | Record<number, string>;
  xpEarned?: number;
  timestamp: string;
};

export type AvatarConfig = {
  base: string;
  color: string;
  hair?: string;
  hat?: string;
  outfit?: string;
  accessory?: string;
};

export type Student = {
  id: string;
  name: string;
  password?: string;
  age?: number;
  level?: number | string;
  rankName?: string;
  levelRank?: string | number;
  avatar: string | AvatarConfig;
  rating: number;
  streak: number;
  maxStreak?: number;
  solvedCount: number;
  lastActiveDate?: string;
  coins: number;
  xp?: number;
  kidsMode?: boolean;
  notes?: string;
  streakShields?: number;
  inventory?: string[];
  unlockedAvatars: string[];
};

export type ContentType = string;

export type ContentItem = {
  id: string;
  title: string;
  type: string;
  description: string;
  difficulty: string | number;
  category?: string;
  tags?: string[];
  xpReward?: number;
  author?: string;
  pgn?: string;
  fen?: string;
  data?: any;
  createdAt?: string;
};

export type TaskAssignment = {
  id: string;
  studentId: string;
  contentId: string;
  assignedDate?: string;
  assignedAt?: string;
  completed?: boolean;
  completedAt?: string;
  status?: string;
  score?: number;
  attempts?: number;
  timeSpentSeconds?: number;
  firstTrySuccess?: boolean;
  studentComments?: string | Record<number, string>;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type PuzzleData = any;
export type GameData = any;
export type AnalysisData = any;
export type BotMatchData = any;
export type PieceCaptureData = any;
export type PawnBattleData = any;
export type LessonData = any;