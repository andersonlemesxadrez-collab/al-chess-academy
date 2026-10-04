import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent: React.FC = () => {
  // Adicionamos setRole para permitir que alunos voltem à tela deles
  const { role, currentStudentId, setRole } = useApp();
  
  // Estado para controlar a autenticação do professor
  const [isTeacherLogged, setIsTeacherLogged] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState('');

  // DEFINA AQUI A SUA SENHA DE PROFESSOR
  const MASTER_PASSWORD = 'xadrezproal';

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPassword === MASTER_PASSWORD) {
      setIsTeacherLogged(true);
    } else {
      alert('Senha incorreta. Acesso negado.');
      setTeacherPassword('');
    }
  };

  // 1. Barreira do Aluno: Se for aluno e não estiver logado
  if (role === 'student' && !currentStudentId) {
    return <LoginScreen />;
  }

  // 2. Barreira do Professor: Se for professor e não tiver inserido a senha
  if (role === 'teacher' && !isTeacherLogged) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-center text-slate-500 mb-8">Insira a senha do Professor</p>
          
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                placeholder="Sua senha secreta..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              Entrar no Painel
            </button>
          </form>

          {/* Botão de fuga para alunos que caiam aqui por engano */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                if (setRole) setRole('student');
              }} 
              className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors"
            >
              És um aluno? Clica aqui para o teu Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Aplicação Principal (Só chega aqui se passou pelas barreiras)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div>
        <Navbar />
        <main className="pb-16">
          {role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
        </main>
      </div>

      {/* Brand Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">
              AL Chess Academy
            </span>
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