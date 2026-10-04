export interface Student {
  id: string;
  name: string;
  password?: string;
  age: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  kidsMode: boolean;
  xp: number;
  streak: number;
  streakShields: number;
  levelRank: number;
  rankName: string;
  avatar: {
    base: string;
    color: string;
    hat?: string;
    hair?: string;
    outfit?: string;
    accessory?: string;
  };
  inventory?: string[];
  notes?: string;
}

export type ContentType = 'puzzle' | 'game' | 'lesson' | 'analysis' | 'bot_match' | 'piece_capture' | 'pawn_battle';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  author: string;
  tags: string[];
  data: any;
}

export interface TaskAssignment {
  id: string;
  studentId: string;
  contentId: string;
  status: 'pending' | 'completed';
  assignedDate: string;
  completedDate?: string;
  timeSpentSeconds?: number;
  attempts?: number;
  firstTrySuccess?: boolean;
  studentComments?: Record<number, string>;
}

export interface PuzzleData {
  fen: string;
  solutionMoves: string[];
  turn: 'w' | 'b';
  hint?: string;
  explanation?: string;
}

export interface GameMoveData {
  san: string;
  comment?: string;
  teacherPrompt?: string; // Pergunta que o professor deixa para o aluno neste lance específico
  requiresStudentReflection?: boolean; // Se true, indica que o aluno deve refletir e responder neste ponto
}

export interface GameData {
  white: string;
  black: string;
  event: string;
  date: string;
  result: string;
  initialFen?: string;
  moves: GameMoveData[];
}

export interface LessonSection {
  title: string;
  text: string;
  fen?: string;
  highlightSquares?: string[];
  arrows?: [string, string][];
}

export interface LessonData {
  sections: LessonSection[];
}

export interface AnalysisData {
  white: string;
  black: string;
  date: string;
  initialFen?: string;
  guidanceText?: string;
  moves: GameMoveData[];
}

export interface BotMatchData {
  initialFen?: string;
  botLevel: number;
  objective: string;
}

export interface PieceCaptureData {
  initialFen?: string;
  targetPieces: string[];
}

export interface PawnBattleData {
  initialFen?: string;
  winningCondition: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}