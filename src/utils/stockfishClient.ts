/**
 * Cliente mínimo para o Stockfish WASM rodando em um Web Worker (protocolo UCI).
 * Requer o arquivo do motor acessível em `/stockfish.js` (ex.: public/stockfish.js).
 */

export interface SearchOptions {
  depth: number;
  /** Teto de tempo em ms (opcional). Evita buscas muito longas em profundidades altas. */
  movetime?: number;
}

export interface SearchResult {
  /** Melhor lance em notação UCI (ex.: "e2e4", "e7e8q"). */
  bestmove: string;
  /** Avaliação em centipeões do ponto de vista das BRANCAS (mate vira ±10000). */
  cp: number;
}

type Listener = (line: string) => void;

export class StockfishClient {
  private worker: Worker | null = null;
  private listeners = new Set<Listener>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly url = '/stockfish-19-lite-single.js') {}

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  private waitFor(match: (line: string) => boolean, timeoutMs?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            this.listeners.delete(listener);
            reject(new Error('Tempo esgotado aguardando o Stockfish'));
          }, timeoutMs)
        : undefined;
      const listener: Listener = (line) => {
        if (!match(line)) return;
        clearTimeout(timer);
        this.listeners.delete(listener);
        resolve(line);
      };
      this.listeners.add(listener);
    });
  }

  async init(): Promise<void> {
    this.worker = new Worker(this.url);
    this.worker.onmessage = (e: MessageEvent) => {
      const line = String(e.data).trim();
      this.listeners.forEach((l) => l(line));
    };

    const uciok = this.waitFor((l) => l === 'uciok', 15000);
    this.send('uci');
    await uciok;

    const ready = this.waitFor((l) => l === 'readyok', 15000);
    this.send('isready');
    await ready;
  }

  setOptions(options: Record<string, string | number | boolean>) {
    for (const [name, value] of Object.entries(options)) {
      this.send(`setoption name ${name} value ${value}`);
    }
  }

  async newGame(): Promise<void> {
    this.send('ucinewgame');
    const ready = this.waitFor((l) => l === 'readyok', 10000);
    this.send('isready');
    await ready;
  }

  /** Busca em fila: nunca há duas buscas simultâneas no mesmo worker. */
  search(fen: string, { depth, movetime }: SearchOptions): Promise<SearchResult> {
    const run = () => this.runSearch(fen, depth, movetime);
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => undefined);
    return p;
  }

  private async runSearch(fen: string, depth: number, movetime?: number): Promise<SearchResult> {
    const whiteToMove = fen.split(' ')[1] === 'w';
    let cp = 0;

    const onInfo: Listener = (line) => {
      if (!line.startsWith('info') || line.includes('lowerbound') || line.includes('upperbound')) return;
      const m = line.match(/score (cp|mate) (-?\d+)/);
      if (!m) return;
      const raw = parseInt(m[2], 10);
      const sign = whiteToMove ? 1 : -1;
      if (m[1] === 'cp') {
        cp = raw * sign;
      } else if (raw === 0) {
        cp = whiteToMove ? -10000 : 10000; // quem joga já está em mate
      } else {
        cp = Math.sign(raw) * (10000 - Math.abs(raw)) * sign;
      }
    };

    this.listeners.add(onInfo);
    const done = this.waitFor((l) => l.startsWith('bestmove'));
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}${movetime ? ` movetime ${movetime}` : ''}`);
    const line = await done;
    this.listeners.delete(onInfo);

    return { bestmove: line.split(' ')[1] ?? '(none)', cp };
  }

  stop() {
    this.send('stop');
  }

  destroy() {
    this.listeners.clear();
    this.worker?.terminate();
    this.worker = null;
  }
}