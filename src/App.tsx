import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { GraduationCap, Lock, User, ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, setRole, currentStudentId, setCurrentStudentId, students } = useApp();
  
  const [isTeacherLogged, setIsTeacherLogged] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const nameInput = loginName.trim();

    // 1. VERIFICAÇÃO DO PROFESSOR
    if (nameInput === 'Anderson' && loginPassword === '1981') {
      if (setRole) setRole('teacher');
      setIsTeacherLogged(true);
      return;
    }

    // 2. VERIFICAÇÃO DE ALUNOS
    if (students && students.length > 0) {
      const foundStudent = students.find(
        (s: any) => s.name.toLowerCase() === nameInput.toLowerCase() && s.password === loginPassword
      );

      if (foundStudent) {
        if (setRole) setRole('student');
        if (setCurrentStudentId) setCurrentStudentId(foundStudent.id);
        setIsTeacherLogged(false);
        return;
      }
    }

    // 3. FALHA NO LOGIN
    setLoginError('Nome ou senha incorretos. Verifique os dados inseridos.');
  };

  const isStudentLogged = role === 'student' && currentStudentId;
  const isTeacherActuallyLogged = role === 'teacher' && isTeacherLogged;

  // Ecrã de Login Unificado (Otimizado para mobile e desktop)
  if (!isStudentLogged && !isTeacherActuallyLogged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-500 selection:text-white">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 transform transition-all">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
              <GraduationCap className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-center text-slate-900 tracking-tight">
            AL Chess <span className="text-blue-600">Academy</span>
          </h1>
          <p className="text-center text-xs text-slate-500 mt-1 mb-8">
            Insira o seu Nome e Senha para entrar na plataforma
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome de Acesso
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Ex: Gabriel Silva ou Anderson"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha Secreta
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>
            
            {loginError && (
              <div className="bg-rose-50 text-rose-700 text-xs text-center font-bold py-3 px-4 rounded-xl border border-rose-200 flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 mt-2"
            >
              Entrar na Conta
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Aplicação Principal Responsiva
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div>
        <Navbar />
        <main className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
        </main>
      </div>

      {/* Rodapé Padrão Adaptável */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">AL Chess Academy</span>
            <span>•</span>
            <span>Metodologia Prof. Anderson Lemes</span>
          </div>
          <div className="text-slate-400">
            Plataforma interativa para ensino personalizado de xadrez
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}