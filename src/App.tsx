import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent: React.FC = () => {
  const { role, currentStudentId } = useApp();

  // Se o papel for 'student' mas nenhum ID estiver selecionado, exibe o ecrã de login seguro
  if (role === 'student' && !currentStudentId) {
    return <LoginScreen />;
  }

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