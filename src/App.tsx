import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

const MainContent: React.FC = () => {
  // Puxamos os dados necessários do contexto global da aplicação
  const { role, setRole, currentStudentId, setCurrentStudentId, students } = useApp();
  
  // Estados para o nosso novo Ecrã Unificado de Login
  const [isTeacherLogged, setIsTeacherLogged] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Limpa erros anteriores

    const nameInput = loginName.trim();

    // 1. VERIFICAÇÃO DO PROFESSOR
    if (nameInput === 'Anderson' && loginPassword === '1981') {
      if (setRole) setRole('teacher');
      setIsTeacherLogged(true);
      return;
    }

    // 2. VERIFICAÇÃO DE ALUNOS
    if (students && students.length > 0) {
      // Procura um aluno com o nome e senha digitados (ignorando maiúsculas/minúsculas no nome)
      const foundStudent = students.find(
        (s: any) => s.name.toLowerCase() === nameInput.toLowerCase() && s.password === loginPassword
      );

      if (foundStudent) {
        if (setRole) setRole('student');
        if (setCurrentStudentId) setCurrentStudentId(foundStudent.id);
        setIsTeacherLogged(false); // Garante que o modo professor é desativado
        return;
      }
    }

    // 3. FALHA NO LOGIN
    setLoginError('Nome ou senha incorretos.');
  };

  // Verifica se alguém conseguiu passar pelas barreiras de segurança
  const isStudentLogged = role === 'student' && currentStudentId;
  const isTeacherActuallyLogged = role === 'teacher' && isTeacherLogged;

  // Se NINGUÉM estiver logado, mostra o Ecrã de Login Unificado
  if (!isStudentLogged && !isTeacherActuallyLogged) {
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
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">AL Chess Academy</h2>
          <p className="text-center text-slate-500 mb-8">Insira o seu Nome e Senha para entrar</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Nome..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Senha..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm text-center font-semibold py-2 px-4 rounded-lg border border-red-100">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-4"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Aplicação Principal (Só chega aqui se o login for bem sucedido)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div>
        <Navbar />
        <main className="pb-16">
          {role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
        </main>
      </div>

      {/* Rodapé Padrão */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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