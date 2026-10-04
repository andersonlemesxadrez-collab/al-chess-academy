import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  ContentItem,
  TaskAssignment,
  ActivityLogEntry,
  UserRole,
  Achievement,
} from '../types/chess';
import {
  INITIAL_STUDENTS,
  INITIAL_CONTENT,
  INITIAL_ASSIGNMENTS,
  INITIAL_ACTIVITY_LOGS,
  ACHIEVEMENTS,
} from '../data/seedData';
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

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('al_chess_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [contents, setContents] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('al_chess_content');
    return saved ? JSON.parse(saved) : INITIAL_CONTENT;
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('al_chess_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [assignments, setAssignments] = useState<TaskAssignment[]>(() => {
    const saved = localStorage.getItem('al_chess_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem('al_chess_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('al_chess_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('al_chess_student_id', currentStudentId);
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem('al_chess_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('al_chess_content', JSON.stringify(contents));
  }, [contents]);

  useEffect(() => {
    localStorage.setItem('al_chess_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem('al_chess_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('al_chess_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

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

  const toggleKidsMode = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return { ...student, kidsMode: !student.kidsMode };
        }
        return student;
      })
    );
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'xp' | 'levelRank' | 'rankName' | 'streak' | 'maxStreak' | 'streakShields' | 'lastActiveDate' | 'enrolledSince'>) => {
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
  };

  const updateStudent = (studentId: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...data } : s))
    );
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAssignments((prev) => prev.filter((a) => a.studentId !== studentId));
  };

  // Content actions
  const addContent = (contentData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newContent: ContentItem = {
      ...contentData,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContents((prev) => [newContent, ...prev]);
  };

  const updateContent = (contentId: string, data: Partial<ContentItem>) => {
    setContents((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, ...data } : c))
    );
  };

  const duplicateContent = (contentId: string) => {
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
  };

  const deleteContent = (contentId: string) => {
    setContents((prev) => prev.filter((c) => c.id !== contentId));
    setAssignments((prev) => prev.filter((a) => a.contentId !== contentId));
  };

  const addCustomCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed || customCategories.includes(trimmed)) return;
    setCustomCategories((prev) => [...prev, trimmed]);
  };

  // Assign task to student
  const assignTask = (studentId: string, contentId: string) => {
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
  };

  const assignContentToMultipleStudents = (contentId: string, studentIds: string[]) => {
    const newAssignments: TaskAssignment[] = [];
    studentIds.forEach((studentId) => {
      const exists = assignments.some(
        (a) => a.studentId === studentId && a.contentId === contentId && a.status === 'pending'
      );
      if (!exists) {
        newAssignments.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          contentId,
          status: 'pending',
          assignedAt: new Date().toISOString(),
          attempts: 0,
          timeSpentSeconds: 0,
        });
      }
    });

    if (newAssignments.length > 0) {
      setAssignments((prev) => [...prev, ...newAssignments]);
    }
  };

  const unassignTask = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  const copyTasksToStudent = (fromStudentId: string, targetStudentId: string) => {
    const sourceTasks = assignments.filter((a) => a.studentId === fromStudentId);
    const existingTargetContentIds = new Set(
      assignments.filter((a) => a.studentId === targetStudentId).map((a) => a.contentId)
    );

    const newAssignments: TaskAssignment[] = [];
    sourceTasks.forEach((task) => {
      if (!existingTargetContentIds.has(task.contentId)) {
        newAssignments.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId: targetStudentId,
          contentId: task.contentId,
          status: 'pending',
          assignedAt: new Date().toISOString(),
          attempts: 0,
          timeSpentSeconds: 0,
        });
      }
    });

    if (newAssignments.length > 0) {
      setAssignments((prev) => [...prev, ...newAssignments]);
    }
  };

  const completeTask = (
    assignmentId: string,
    timeSpentSeconds: number,
    attempts: number,
    firstTrySuccess: boolean
  ) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const content = contents.find((c) => c.id === assignment.contentId);
    const xpReward = content ? content.xpReward : 50;

    // Update assignment
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'completed',
              completedAt: new Date().toISOString(),
              timeSpentSeconds: a.timeSpentSeconds + timeSpentSeconds,
              attempts: a.attempts + attempts,
              firstTrySuccess,
              score: firstTrySuccess ? 100 : Math.max(50, 100 - (attempts - 1) * 20),
            }
          : a
      )
    );

    // Update student XP, Rank & Streak
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === assignment.studentId) {
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

          return {
            ...student,
            xp: newXp,
            levelRank: currentRank.level,
            rankName: currentRank.name,
            streak: newStreak,
            maxStreak: Math.max(newStreak, student.maxStreak),
            lastActiveDate: today,
          };
        }
        return student;
      })
    );

    // Add activity log
    const newLog: ActivityLogEntry = {
      id: `log-${Date.now()}`,
      studentId: assignment.studentId,
      action:
        content?.type === 'game'
          ? 'game_analyzed'
          : content?.type === 'lesson'
          ? 'lesson_completed'
          : content?.type === 'analysis'
          ? 'analysis_submitted'
          : 'puzzle_solved',
      title: `${content?.title || 'Atividade'} concluída!`,
      xpEarned: xpReward,
      timestamp: new Date().toISOString(),
      details: firstTrySuccess ? 'Acertou de primeira!' : `Concluído em ${attempts} tentativas (${timeSpentSeconds}s).`,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setContents(INITIAL_CONTENT);
    setAssignments(INITIAL_ASSIGNMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCustomCategories(DEFAULT_CATEGORIES);
    setRoleState('teacher');
    setCurrentStudentIdState('student-1');
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
