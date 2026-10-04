import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight, GraduationCap, Lock, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { students, setCurrentStudentId, setRole } = useApp();
  const [nameInput, setNameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nameInput.trim() || !passwordInput.trim()) {
      setError('Por favor, preencha o nome e a senha.');
      return;
    }

    // Procura o aluno pelo nome (ignorando maiúsculas/minúsculas) e pela senha
    const foundStudent = students.find(
      (st) =>
        st.name.trim().toLowerCase() === nameInput.trim().toLowerCase() &&
        st.password === passwordInput.trim()
    );

    if (foundStudent) {
      setCurrentStudentId(foundStudent.id);
      setRole('student');
    } else {
      setError('Nome ou senha incorretos. Verifique com o Professor Anderson.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg text-white mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Portal do Aluno
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digite o seu nome e a senha secreta fornecida pelo professor.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Seu Nome
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Gabriel Silva"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition"
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
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Sua senha..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg transition transform active:scale-98 mt-2"
          >
            <span>Entrar na Minha Conta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => setRole('teacher')}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Acesso Exclusivo do Professor Anderson</span>
          </button>
        </div>
      </div>
    </div>
  );
};