import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Student,
  ContentItem,
  TaskAssignment,
  ActivityLogEntry,
  UserRole,
  Achievement,
  GameRecord,
  NewGameInput,
} from '../types/chess';
import {
  INITIAL_STUDENTS,
  INITIAL_CONTENT,
  INITIAL_ASSIGNMENTS,
  INITIAL_ACTIVITY_LOGS,
  ACHIEVEMENTS,
} from '../data/seedData';
import { supabase } from '../supabaseClient';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface AppContextType {
  role: UserRole;
  currentStudentId: string;
  students: Student[];
  contents: ContentItem[];
  assignments: TaskAssignment[];
  activityLogs: ActivityLogEntry[];
  achievements: Achievement[];
  currentStudent: Student | undefined;
  customCategories: string[];
  /** Partidas contra o bot já concluídas (sem PGN). */
  games: GameRecord[];
  /** true quando o professor está vendo o app como aluno: nada é registrado. */
  isTeacherPreview: boolean;

  // Actions
  setRole: (role: UserRole) => void;
  setCurrentStudentId: (id: string) => void;
  toggleKidsMode: (studentId: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'xp' | 'levelRank' | 'rankName' | 'streak' | 'maxStreak' | 'streakShields' | 'lastActiveDate' | 'enrolledSince'>) => void;
  updateStudent: (studentId: string, data: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  updateContent: (contentId: string, data: Partial<ContentItem>) => void;
  duplicateContent: (contentId: string) => void;
  deleteContent: (contentId: string) => void;
  addCustomCategory: (category: string) => void;
  assignTask: (studentId: string, contentId: string) => void;
  assignContentToMultipleStudents: (contentId: string, studentIds: string[]) => void;
  unassignTask: (assignmentId: string) => void;
  copyTasksToStudent: (fromStudentId: string, targetStudentId: string) => void;
  completeTask: (assignmentId: string, timeSpentSeconds: number, attempts: number, firstTrySuccess: boolean) => void;
  triggerConfetti: () => void;
  resetAllData: () => void;
  setTeacherSession: (active: boolean) => void;
  saveGame: (game: NewGameInput) => Promise<string | null>;
  attachGameDiagnostics: (gameId: string, diagnostics: any) => Promise<void>;
  /** Só o painel do professor deve chamar esta função. */
  fetchGamePgn: (gameId: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const RANKS = [
  { level: 1, name: 'Peão Curioso', xpRequired: 0, icon: '♟️' },
  { level: 2, name: 'Cavalo Esperto', xpRequired: 100, icon: '♞' },
  { level: 3, name: 'Bispo Estratégico', xpRequired: 300, icon: '♝' },
  { level: 4, name: 'Torre Poderosa', xpRequired: 600, icon: '♜' },
  { level: 5, name: 'Dama Brilhante', xpRequired: 1000, icon: '♛' },
  { level: 6, name: 'Rei Mestre', xpRequired: 1500, icon: '♚' },
  { level: 7, name: 'Grão-Mestre', xpRequired: 2500, icon: '👑' },
];

const DEFAULT_CATEGORIES = [
  'Tática',
  'Aberturas',
  'Finais',
  'Estratégia',
  'Fundamentos',
  'Análise',
  'Mates Básicos',
  'Garfos e Cravadas',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('al_chess_role') as UserRole) || 'teacher';
  });

  const [currentStudentId, setCurrentStudentIdState] = useState<string>(() => {
    return localStorage.getItem('al_chess_student_id') || 'student-1';
  });

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [assignments, setAssignments] = useState<TaskAssignment[]>(INITIAL_ASSIGNMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  const [customCategories, setCustomCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [teacherSession, setTeacherSessionState] = useState(false);
  // Impede concluir a mesma atividade duas vezes (cliques repetidos ou duas abas)
  const completingRef = useRef<Set<string>>(new Set());

  // Carregar dados iniciais do Supabase na primeira execução
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        const { data: dbStudents } = await supabase.from('students').select('*');
        if (dbStudents && dbStudents.length > 0) {
          // Mapeia do formato do banco para o formato do App se necessário
          const formattedStudents: Student[] = dbStudents.map((s: any) => ({
            id: s.id,
            name: s.name,
            password: s.password,
            age: s.age,
            level: s.level,
            kidsMode: s.kids_mode,
            avatar: s.avatar,
            rating: s.rating,
            streak: s.streak,
            maxStreak: s.max_streak,
            solvedCount: s.solved_count,
            coins: s.coins,
            xp: s.xp,
            levelRank: s.level_rank,
            rankName: s.rank_name,
            unlockedAvatars: s.unlocked_avatars,
            lastActiveDate: s.last_active_date,
            enrolledSince: s.enrolled_since,
            notes: s.notes,
            weaknesses: Array.isArray(s.weaknesses) ? s.weaknesses : [],
          }));
          setStudents(formattedStudents);
        } else {
          // Se o banco estiver vazio, insere os dados iniciais do seedData
          for (const s of INITIAL_STUDENTS) {
            await supabase.from('students').upsert({
              id: s.id,
              name: s.name,
              password: s.password,
              age: s.age,
              level: s.level,
              kids_mode: s.kidsMode,
              avatar: s.avatar,
              rating: s.rating,
              streak: s.streak,
              max_streak: s.maxStreak,
              solved_count: s.solvedCount,
              coins: s.coins,
              xp: s.xp,
              level_rank: s.levelRank,
              rank_name: s.rankName,
              unlocked_avatars: s.unlockedAvatars,
              last_active_date: s.lastActiveDate,
              enrolled_since: s.enrolledSince,
              notes: s.notes,
            });
          }
        }

        const { data: dbContents } = await supabase.from('contents').select('*');
        if (dbContents && dbContents.length > 0) {
          const formattedContents: ContentItem[] = dbContents.map((c: any) => ({
            id: c.id,
            title: c.title,
            type: c.type,
            description: c.description,
            difficulty: c.difficulty,
            category: c.category,
            tags: c.tags,
            xpReward: c.xp_reward,
            author: c.author,
            pgn: c.pgn,
            fen: c.fen,
            data: c.data,
            createdAt: c.created_at,
          }));
          setContents(formattedContents);
        } else {
          for (const c of INITIAL_CONTENT) {
            await supabase.from('contents').upsert({
              id: c.id,
              title: c.title,
              type: c.type,
              description: c.description,
              difficulty: c.difficulty,
              category: c.category,
              tags: c.tags,
              xp_reward: c.xpReward,
              author: c.author,
              pgn: c.pgn,
              fen: c.fen,
              data: c.data,
              created_at: c.createdAt,
            });
          }
        }

        const { data: dbAssignments } = await supabase.from('assignments').select('*');
        if (dbAssignments && dbAssignments.length > 0) {
          const formattedAssignments: TaskAssignment[] = dbAssignments.map((a: any) => ({
            id: a.id,
            studentId: a.student_id,
            contentId: a.content_id,
            assignedDate: a.assigned_date,
            assignedAt: a.assigned_at,
            completed: a.completed,
            completedAt: a.completed_at,
            status: a.status,
            score: a.score,
            attempts: a.attempts,
            timeSpentSeconds: a.time_spent_seconds,
            firstTrySuccess: a.first_try_success,
            studentComments: a.student_comments,
          }));
          setAssignments(formattedAssignments);
        } else {
          for (const a of INITIAL_ASSIGNMENTS) {
            await supabase.from('assignments').upsert({
              id: a.id,
              student_id: a.studentId,
              content_id: a.contentId,
              assigned_date: a.assignedDate,
              assigned_at: a.assignedAt,
              completed: a.completed,
              completed_at: a.completedAt,
              status: a.status,
              score: a.score,
              attempts: a.attempts,
              time_spent_seconds: a.timeSpentSeconds,
              first_try_success: a.firstTrySuccess,
              student_comments: a.studentComments,
            });
          }
        }
      } catch (err) {
        console.error('Erro ao sincronizar com o Supabase:', err);
      }
    }

    loadDataFromSupabase();
  }, []);

  useEffect(() => {
    async function loadGames() {
      try {
        // O PGN fica de fora de propósito: só o painel do professor o busca.
        const { data, error } = await supabase
          .from('games')
          .select('id, assignment_id, student_id, content_id, level, player_color, result, reason, start_fen, moves, diagnostics, duration_seconds, finished_at')
          .order('finished_at', { ascending: false });
        if (error || !data) return;
        setGames(
          data.map((g: any) => ({
            id: g.id,
            assignmentId: g.assignment_id ?? undefined,
            studentId: g.student_id,
            contentId: g.content_id ?? undefined,
            level: g.level ?? undefined,
            playerColor: g.player_color,
            result: g.result,
            reason: g.reason ?? undefined,
            startFen: g.start_fen ?? undefined,
            moves: Array.isArray(g.moves) ? g.moves : [],
            diagnostics: g.diagnostics ?? undefined,
            durationSeconds: g.duration_seconds ?? undefined,
            finishedAt: g.finished_at,
          }))
        );
      } catch (err) {
        console.error('Erro ao carregar partidas:', err);
      }
    }
    loadGames();
  }, []);

  useEffect(() => {
    localStorage.setItem('al_chess_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('al_chess_student_id', currentStudentId);
  }, [currentStudentId]);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];
  const isTeacherPreview = teacherSession && role === 'student';

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const setCurrentStudentId = (id: string) => {
    setCurrentStudentIdState(id);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F5C542', '#3B82F6', '#22C55E', '#EC4899', '#8B5CF6'],
      });
    } catch {
      // ignore
    }
  };

  const toggleKidsMode = async (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    const newKidsMode = !target.kidsMode;

    setStudents((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, kidsMode: newKidsMode } : student))
    );

    await supabase.from('students').update({ kids_mode: newKidsMode }).eq('id', studentId);
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'xp' | 'levelRank' | 'rankName' | 'streak' | 'maxStreak' | 'streakShields' | 'lastActiveDate' | 'enrolledSince'>) => {
    const newId = `student-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      xp: 0,
      levelRank: 1,
      rankName: 'Peão Curioso',
      streak: 1,
      maxStreak: 1,
      streakShields: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      enrolledSince: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => [...prev, newStudent]);

    await supabase.from('students').insert({
      id: newStudent.id,
      name: newStudent.name,
      password: newStudent.password,
      age: newStudent.age,
      level: newStudent.level,
      kids_mode: newStudent.kidsMode,
      avatar: newStudent.avatar,
      rating: newStudent.rating,
      streak: newStudent.streak,
      max_streak: newStudent.maxStreak,
      solved_count: newStudent.solvedCount,
      coins: newStudent.coins,
      xp: newStudent.xp,
      level_rank: newStudent.levelRank,
      rank_name: newStudent.rankName,
      unlocked_avatars: newStudent.unlockedAvatars,
      last_active_date: newStudent.lastActiveDate,
      enrolled_since: newStudent.enrolledSince,
      notes: newStudent.notes,
    });
  };

  const updateStudent = async (studentId: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...data } : s))
    );

    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.password !== undefined) dbData.password = data.password;
    if (data.age !== undefined) dbData.age = data.age;
    if (data.level !== undefined) dbData.level = data.level;
    if (data.kidsMode !== undefined) dbData.kids_mode = data.kidsMode;
    if (data.avatar !== undefined) dbData.avatar = data.avatar;
    if (data.xp !== undefined) dbData.xp = data.xp;
    if (data.levelRank !== undefined) dbData.level_rank = data.levelRank;
    if (data.rankName !== undefined) dbData.rank_name = data.rankName;
    if (data.streak !== undefined) dbData.streak = data.streak;
    if (data.maxStreak !== undefined) dbData.max_streak = data.maxStreak;
    if (data.weaknesses !== undefined) dbData.weaknesses = data.weaknesses;

    await supabase.from('students').update(dbData).eq('id', studentId);
  };

  const deleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAssignments((prev) => prev.filter((a) => a.studentId !== studentId));

    await supabase.from('students').delete().eq('id', studentId);
  };

  const addContent = async (contentData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newContent: ContentItem = {
      ...contentData,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContents((prev) => [newContent, ...prev]);

    await supabase.from('contents').insert({
      id: newContent.id,
      title: newContent.title,
      type: newContent.type,
      description: newContent.description,
      difficulty: newContent.difficulty,
      category: newContent.category,
      tags: newContent.tags,
      xp_reward: newContent.xpReward,
      author: newContent.author,
      pgn: newContent.pgn,
      fen: newContent.fen,
      data: newContent.data,
      created_at: newContent.createdAt,
    });
  };

  const updateContent = async (contentId: string, data: Partial<ContentItem>) => {
    setContents((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, ...data } : c))
    );

    const dbData: any = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.difficulty !== undefined) dbData.difficulty = data.difficulty;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.xpReward !== undefined) dbData.xp_reward = data.xpReward;
    if (data.data !== undefined) dbData.data = data.data;

    await supabase.from('contents').update(dbData).eq('id', contentId);
  };

  const duplicateContent = async (contentId: string) => {
    const original = contents.find((c) => c.id === contentId);
    if (!original) return;

    const duplicated: ContentItem = {
      ...original,
      id: `custom-${Date.now()}`,
      title: `${original.title} (Cópia)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContents((prev) => [duplicated, ...prev]);
    sounds.playMove();

    await supabase.from('contents').insert({
      id: duplicated.id,
      title: duplicated.title,
      type: duplicated.type,
      description: duplicated.description,
      difficulty: duplicated.difficulty,
      category: duplicated.category,
      tags: duplicated.tags,
      xp_reward: duplicated.xpReward,
      author: duplicated.author,
      pgn: duplicated.pgn,
      fen: duplicated.fen,
      data: duplicated.data,
      created_at: duplicated.createdAt,
    });
  };

  const deleteContent = async (contentId: string) => {
    setContents((prev) => prev.filter((c) => c.id !== contentId));
    setAssignments((prev) => prev.filter((a) => a.contentId !== contentId));

    await supabase.from('contents').delete().eq('id', contentId);
  };

  const addCustomCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed || customCategories.includes(trimmed)) return;
    setCustomCategories((prev) => [...prev, trimmed]);
  };

  const assignTask = async (studentId: string, contentId: string) => {
    const exists = assignments.some(
      (a) => a.studentId === studentId && a.contentId === contentId && a.status === 'pending'
    );
    if (exists) return;

    const newAssignment: TaskAssignment = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      contentId,
      status: 'pending',
      assignedAt: new Date().toISOString(),
      attempts: 0,
      timeSpentSeconds: 0,
    };
    setAssignments((prev) => [...prev, newAssignment]);

    await supabase.from('assignments').insert({
      id: newAssignment.id,
      student_id: newAssignment.studentId,
      content_id: newAssignment.contentId,
      status: newAssignment.status,
      assigned_at: newAssignment.assignedAt,
      attempts: newAssignment.attempts,
      time_spent_seconds: newAssignment.timeSpentSeconds,
    });
  };

  const assignContentToMultipleStudents = async (contentId: string, studentIds: string[]) => {
    const newAssignments: TaskAssignment[] = [];
    const dbInserts: any[] = [];

    studentIds.forEach((studentId) => {
      const exists = assignments.some(
        (a) => a.studentId === studentId && a.contentId === contentId && a.status === 'pending'
      );
      if (!exists) {
        const item = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          contentId,
          status: 'pending',
          assignedAt: new Date().toISOString(),
          attempts: 0,
          timeSpentSeconds: 0,
        };
        newAssignments.push(item);
        dbInserts.push({
          id: item.id,
          student_id: item.studentId,
          content_id: item.contentId,
          status: item.status,
          assigned_at: item.assignedAt,
          attempts: item.attempts,
          time_spent_seconds: item.timeSpentSeconds,
        });
      }
    });

    if (newAssignments.length > 0) {
      setAssignments((prev) => [...prev, ...newAssignments]);
      await supabase.from('assignments').insert(dbInserts);
    }
  };

  const unassignTask = async (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    await supabase.from('assignments').delete().eq('id', assignmentId);
  };

  const copyTasksToStudent = async (fromStudentId: string, targetStudentId: string) => {
    const sourceTasks = assignments.filter((a) => a.studentId === fromStudentId);
    const existingTargetContentIds = new Set(
      assignments.filter((a) => a.studentId === targetStudentId).map((a) => a.contentId)
    );

    const newAssignments: TaskAssignment[] = [];
    const dbInserts: any[] = [];

    sourceTasks.forEach((task) => {
      if (!existingTargetContentIds.has(task.contentId)) {
        const item = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId: targetStudentId,
          contentId: task.contentId,
          status: 'pending',
          assignedAt: new Date().toISOString(),
          attempts: 0,
          timeSpentSeconds: 0,
        };
        newAssignments.push(item);
        dbInserts.push({
          id: item.id,
          student_id: item.studentId,
          content_id: item.contentId,
          status: item.status,
          assigned_at: item.assignedAt,
          attempts: item.attempts,
          time_spent_seconds: item.timeSpentSeconds,
        });
      }
    });

    if (newAssignments.length > 0) {
      setAssignments((prev) => [...prev, ...newAssignments]);
      await supabase.from('assignments').insert(dbInserts);
    }
  };

  const completeTask = async (
    assignmentId: string,
    timeSpentSeconds: number,
    attempts: number,
    firstTrySuccess: boolean
  ) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    // Prévia do professor não registra nada.
    if (isTeacherPreview) return;
    // Uma atividade só pode ser concluída uma vez (XP não pode ser repetido).
    if (assignment.status === 'completed' || completingRef.current.has(assignmentId)) return;
    completingRef.current.add(assignmentId);

    const content = contents.find((c) => c.id === assignment.contentId);
    const xpReward = content ? content.xpReward : 50;

    const updatedAssignment = {
      ...assignment,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: assignment.timeSpentSeconds + timeSpentSeconds,
      attempts: assignment.attempts + attempts,
      firstTrySuccess,
      score: firstTrySuccess ? 100 : Math.max(50, 100 - (attempts - 1) * 20),
    };

    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? updatedAssignment : a))
    );

    await supabase
      .from('assignments')
      .update({
        status: updatedAssignment.status,
        completed_at: updatedAssignment.completedAt,
        time_spent_seconds: updatedAssignment.timeSpentSeconds,
        attempts: updatedAssignment.attempts,
        first_try_success: updatedAssignment.firstTrySuccess,
        score: updatedAssignment.score,
      })
      .eq('id', assignmentId);

    // Atualiza o Aluno afetado
    const student = students.find((s) => s.id === assignment.studentId);
    if (student) {
      const newXp = student.xp + xpReward;
      const currentRank = [...RANKS].reverse().find((r) => newXp >= r.xpRequired) || RANKS[0];
      const today = new Date().toISOString().split('T')[0];
      let newStreak = student.streak;
      if (student.lastActiveDate !== today) {
        newStreak += 1;
      }

      if (student.kidsMode) {
        triggerConfetti();
      }
      sounds.playSuccess();

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                xp: newXp,
                levelRank: currentRank.level,
                rankName: currentRank.name,
                streak: newStreak,
                maxStreak: Math.max(newStreak, s.maxStreak),
                lastActiveDate: today,
              }
            : s
        )
      );

      await supabase
        .from('students')
        .update({
          xp: newXp,
          level_rank: currentRank.level,
          rank_name: currentRank.name,
          streak: newStreak,
          max_streak: Math.max(newStreak, student.maxStreak),
          last_active_date: today,
        })
        .eq('id', student.id);
    }

    const newLog: ActivityLogEntry = {
      id: `log-${Date.now()}`,
      studentId: assignment.studentId,
      action: 'puzzle_solved',
      title: `${content?.title || 'Atividade'} concluída!`,
      xpEarned: xpReward,
      timestamp: new Date().toISOString(),
      details: firstTrySuccess ? 'Acertou de primeira!' : `Concluído em ${attempts} tentativas.`,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const setTeacherSession = (active: boolean) => setTeacherSessionState(active);

  const saveGame = async (game: NewGameInput): Promise<string | null> => {
    const id = `game-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const finishedAt = new Date().toISOString();

    const { error } = await supabase.from('games').insert({
      id,
      assignment_id: game.assignmentId ?? null,
      student_id: game.studentId,
      content_id: game.contentId ?? null,
      level: game.level ?? null,
      player_color: game.playerColor,
      result: game.result,
      reason: game.reason ?? null,
      start_fen: game.startFen ?? null,
      moves: game.moves,
      duration_seconds: Math.round(game.durationSeconds ?? 0),
      finished_at: finishedAt,
    });
    if (error) {
      console.error('Erro ao salvar partida:', error);
      return null;
    }

    const { error: pgnError } = await supabase.from('game_pgns').insert({ game_id: id, pgn: game.pgn });
    if (pgnError) console.error('Erro ao salvar PGN:', pgnError);

    const record: GameRecord = {
      id,
      assignmentId: game.assignmentId,
      studentId: game.studentId,
      contentId: game.contentId,
      level: game.level,
      playerColor: game.playerColor,
      result: game.result,
      reason: game.reason,
      startFen: game.startFen,
      moves: game.moves,
      durationSeconds: game.durationSeconds,
      finishedAt,
    };
    setGames((prev) => [record, ...prev]);
    return id;
  };

  const attachGameDiagnostics = async (gameId: string, diagnostics: any) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, diagnostics } : g)));
    const { error } = await supabase.from('games').update({ diagnostics }).eq('id', gameId);
    if (error) console.error('Erro ao salvar diagnóstico:', error);
  };

  const fetchGamePgn = async (gameId: string): Promise<string | null> => {
    const { data, error } = await supabase.from('game_pgns').select('pgn').eq('game_id', gameId).maybeSingle();
    if (error || !data) return null;
    return data.pgn as string;
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentStudentId,
        students,
        contents,
        assignments,
        activityLogs,
        achievements: ACHIEVEMENTS,
        currentStudent,
        customCategories,
        games,
        isTeacherPreview,
        setRole,
        setCurrentStudentId,
        toggleKidsMode,
        addStudent,
        updateStudent,
        deleteStudent,
        addContent,
        updateContent,
        duplicateContent,
        deleteContent,
        addCustomCategory,
        assignTask,
        assignContentToMultipleStudents,
        unassignTask,
        copyTasksToStudent,
        completeTask,
        triggerConfetti,
        resetAllData,
        setTeacherSession,
        saveGame,
        attachGameDiagnostics,
        fetchGamePgn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};