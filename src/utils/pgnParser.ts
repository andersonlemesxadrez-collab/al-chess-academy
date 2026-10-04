export function parsePgnString(pgn: string) {
  if (!pgn || typeof pgn !== 'string') {
    return {
      white: 'Brancas',
      black: 'Pretas',
      event: 'Partida de Xadrez',
      date: new Date().toLocaleDateString(),
      moves: [],
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    };
  }

  // 1. Remove blocos de comentários entre chavetas { ... } (avaliações de motor, e.g., [%eval 0.15], textos de análise, etc.)
  let text = pgn.replace(/\{[^}]*?\}/g, ' ');

  // 2. Remove parênteses e todo o seu conteúdo recursivamente (variações secundárias de estudo)
  // Repetimos para garantir remoção de parênteses aninhados
  let previousText = '';
  while (text !== previousText) {
    previousText = text;
    text = text.replace(/\([^()]*?\)/g, ' ');
  }

  // 3. Extrai metadados do cabeçalho (Tags como [White "Nome"], [Black "Nome"], [Event "Nome"])
  let white = 'Brancas';
  let black = 'Pretas';
  let event = 'Partida de Xadrez';
  let initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const whiteMatch = pgn.match(/\[White\s+"([^"]+)"\]/i);
  if (whiteMatch) white = whiteMatch[1];

  const blackMatch = pgn.match(/\[Black\s+"([^"]+)"\]/i);
  if (blackMatch) black = blackMatch[1];

  const eventMatch = pgn.match(/\[Event\s+"([^"]+)"\]/i);
  if (eventMatch) event = eventMatch[1];

  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i);
  if (fenMatch) initialFen = fenMatch[1];

  // 4. Remove todas as linhas de cabeçalho do texto de lances
  const lines = text.split('\n');
  const cleanLines = lines.map(line => {
    if (line.trim().startsWith('[')) return '';
    return line;
  });
  const moveText = cleanLines.join(' ');

  // 5. Divide o texto em blocos separados por espaços ou quebras
  const tokens = moveText.split(/\s+/);
  const moves: { san: string }[] = [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    // Ignora numerações de lances (ex: "1.", "12...", "45.")
    if (/^\d+\.(\.\.)?$/.test(trimmed)) continue;
    // Ignora números seguidos de ponto colado sem espaço (ex: "1.d4" -> lida separadamente se necessário, mas tratamos abaixo)
    if (/^\d+\.+/.test(trimmed)) {
      // Caso venha algo como "1.d4", removemos a numeração inicial
      const cleanMove = trimmed.replace(/^\d+\.+/, '');
      if (cleanMove && cleanMove !== '...' && !isResult(cleanMove)) {
        moves.push({ san: cleanMove.replace(/[#\?!]+$/, '') });
      }
      continue;
    }

    // Ignora resultados de partidas
    if (isResult(trimmed)) continue;

    // Limpa pontuações de erro ou anotações coladas no lance (ex: Rfd1??, Bxe4!, O-O+)
    // Mantemos notações válidas de xadrez (incluindo roques O-O e O-O-O)
    const sanitizedSan = trimmed.replace(/[#\?!]+$/, '');

    if (sanitizedSan && sanitizedSan !== '...' && !isResult(sanitizedSan)) {
      moves.push({ san: sanitizedSan });
    }
  }

  return {
    white,
    black,
    event,
    date: new Date().toLocaleDateString(),
    moves,
    initialFen
  };
}

function isResult(token: string): boolean {
  return ['*', '1-0', '0-1', '1/2-1/2', '1-1'].includes(token);
}