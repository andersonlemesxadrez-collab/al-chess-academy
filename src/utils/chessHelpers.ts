import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import { sounds } from './audio';

/** Casa do rei que está em xeque na posição, ou null. */
export function getCheckSquare(fen: string): string | null {
  try {
    const g = new Chess(fen);
    if (!g.inCheck()) return null;
    const turn = g.turn();
    for (const row of g.board()) {
      for (const cell of row) {
        if (cell && cell.type === 'k' && cell.color === turn) return cell.square;
      }
    }
  } catch {
    /* FEN inválido */
  }
  return null;
}

/** Toca o som certo para o lance (xeque, captura ou lance comum). */
export function playSoundForMove(mv: Move) {
  try {
    if (mv.san.includes('+') || mv.san.includes('#')) sounds.playCheck();
    else if (mv.captured) sounds.playCapture();
    else sounds.playMove();
  } catch {
    /* som é opcional */
  }
}

/* localStorage pode lançar erro no Safari (modo privado, armazenamento cheio). */
export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignora */
  }
}

export function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignora */
  }
}
