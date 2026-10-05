import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Zap, Award, Clock, Flame } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

interface PuzzleRushProps {
  onBack: () => void;
}

const RUSH_PUZZLES = [
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', solution: ['Bc4'], title: 'Desenvolvimento Ativo' },
  { fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bP1P3/2N2N2/PP1P1PPP/R1BQKB1R w KQkq - 4 6', solution: ['Nd5'], title: 'Ataque Central' },
  { fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5', solution: ['Bxf7+'], title: 'Sacrifício no F7' },
];

export const PuzzleRush: React.FC<PuzzleRushProps> = ({ onBack }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [game, setGame] = useState(new Chess(RUSH_PUZZLES[0].fen));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          triggerConfetti();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, triggerConfetti]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setCurrentIndex(0);
    setGame(new Chess(RUSH_PUZZLES[0].fen));
  };

  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    if (!isPlaying || gameOver) return false;
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        setGame(new Chess(game.fen()));
        const currentPuzzle = RUSH_PUZZLES[currentIndex % RUSH_PUZZLES.length];
        
        // Verifica se acertou o movimento da solução
        if (move.san === currentPuzzle.solution[0] || move.to === currentPuzzle.solution[0].toLowerCase()) {
          setScore((s) => s + 10);
          setTimeout(() => {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setGame(new Chess(RUSH_PUZZLES[nextIdx % RUSH_PUZZLES.length].fen));
          }, 400);
        } else {
          // Errou, penalidade de tempo ou passa ao próximo
          setTimeout(() => {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setGame(new Chess(RUSH_PUZZLES[nextIdx % RUSH_PUZZLES.length].fen));
          }, 400);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500 fill-amber-400 animate-bounce" />
          <h2 className="text-xl font-black text-slate-900">Puzzle Rush (Cálculo Rápido)</h2>
        </div>
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isPlaying && !gameOver && (
        <div className="text-center py-10 space-y-4">
          <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
            Tens 60 segundos para resolver o máximo de puzzles táticos possível! Testa a tua intuição e ganha XP extra.
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-lg transition active:scale-95"
          >
            Começar Desafio
          </button>
        </div>
      )}

      {isPlaying && !gameOver && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>Tempo: {timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="w-5 h-5" />
              <span>Pontos: {score}</span>
            </div>
          </div>

          <div className="text-center font-bold text-slate-700 text-sm">
            Tema: {RUSH_PUZZLES[currentIndex % RUSH_PUZZLES.length].title}
          </div>

          <div className="max-w-[360px] mx-auto aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-slate-200">
            <Chessboard position={game.fen()} onPieceDrop={handleDrop} boardWidth={360} />
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center py-10 space-y-4">
          <Flame className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-slate-900">Fim do Tempo!</h3>
          <p className="text-sm font-bold text-slate-600">Fizeste <span className="text-amber-600 text-lg">{score} pontos</span> no Puzzle Rush!</p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
          >
            Jogar Novamente
          </button>
        </div>
      )}
    </div>
  );
};