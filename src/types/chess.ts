export type UserRole = 'student' | 'teacher';

export type ActivityLogEntry = {
  id: string;
  action: string;
  timestamp: string;
};

export type Student = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  streak: number;
  maxStreak?: number;
  solvedCount: number;
  lastActiveDate?: string;
  coins: number;
  unlockedAvatars: string[];
};

export type ContentItem = {
  id: string;
  title: string;
  type: 'tactics' | 'bot' | 'piece-capture' | 'pawn-battle' | 'didactic' | 'analysis';
  description: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  pgn?: string;
  fen?: string;
  createdAt?: string;
};

export type TaskAssignment = {
  id: string;
  studentId: string;
  contentId: string;
  assignedDate?: string;
  assignedAt?: string;
  completed: boolean;
  score?: number;
  attempts?: number;
  timeSpentSeconds?: number;
};