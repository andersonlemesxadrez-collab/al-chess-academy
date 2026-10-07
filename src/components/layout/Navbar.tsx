import React from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Users,
  ChevronDown,
} from 'lucide-react';

// 1. Adicionamos a interface para receber a propriedade
interface NavbarProps {
  isTeacherLogged?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isTeacherLogged = false }) => {
  const {
    role,
    setRole,
    currentStudentId,
    setCurrentStudentId,
    students,
    currentStudent,
  } = useApp();

  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1B2A4A] text-white shadow-lg border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#1B2A4A] rounded-[10px] flex items-center justify-center">
              <span className="text-lg sm:text-xl">♞</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-white">
                AL Chess <span className="text-[#F5C542]">Academy</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
                Pioneiro
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-200/70 font-medium -mt-0.5">
              Prof. Anderson Lemes
            </p>
          </div>
        </div>

        {/* Center / Role indicators & Student Selector */}
        <div className="flex items-center space-x-2 max-w-full py-1 overflow-x-auto no-scrollbar">
          
          {/* 2. SÓ MOSTRA OS BOTÕES DE MODO SE O PROFESSOR ESTIVER LOGADO */}
          {isTeacherLogged && (
            <div className="flex items-center bg-blue-950/80 p-1 rounded-xl border border-blue-800/60 shadow-inner shrink-0">
              <button
                onClick={() => setRole('teacher')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === 'teacher'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Painel do Professor</span>
              </button>

              <button
                onClick={() => setRole('student')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-[#F5C542] text-slate-900 shadow-md font-bold'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Visão do Aluno</span>
              </button>
            </div>
          )}

          {/* Student Selector / Restricted view */}
          {isTeacherLogged && role === 'teacher' ? (
            <div className="relative shrink-0">
              <div className="flex items-center gap-1.5 bg-[#24355A] hover:bg-[#2C3F6B] text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-800/80 text-xs font-medium cursor-pointer transition">
                <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <select
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer pr-1 appearance-none max-w-[110px] sm:max-w-none truncate"
                >
                  <option value="" className="bg-[#1B2A4A]">Selecionar Aluno...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[#1B2A4A] text-white">
                      {st.name} ({st.age} anos • {st.kidsMode ? 'Lúdico' : 'Analítico'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-blue-400 pointer-events-none shrink-0" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#24355A] text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-800/80 text-xs font-medium shrink-0 max-w-[120px] truncate">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{currentStudent?.name || 'Estudante'}</span>
            </div>
          )}
        </div>

        {/* Right side widgets */}
        <div className="flex items-center space-x-2 shrink-0">
          {role === 'student' && currentStudent && (
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{currentStudent.streak} dias</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-[#F5C542]" />
                <span>{currentStudent.xp} XP</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
            className="p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800/60 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};