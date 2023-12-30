export type Generator<T> = { next: () => T };
export type Position = { row: number; col: number };
export type Match<T> = { matched: T; positions: Position[] };
export type Board<T> = { data: (T | undefined)[][]; generator: Generator<T>; matches: Match<T>[]; width: number; height: number };
export type Effect<T> = { kind: "Refill"; board: Board<T> } | { kind: "Match"; match: Match<T> };
export type MoveResult<T> = { board: Board<T>; effects: Effect<T>[] };

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {
  const data = Array.from({ length: height }, () => Array.from({ length: width }, () => generator.next()));
  return { data, generator, matches: [], width, height };
}

export function positions<T>(board: Board<T>): Position[] {
  return Array.from({ length: board.height * board.width }, (_, index) => ({ row: Math.floor(index / board.width), col: index % board.width }));
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  return (p.row >= 0 && p.row < board.height && p.col >= 0 && p.col < board.width) ? board.data[p.row][p.col] : undefined;
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
  const [firstPiece, secondPiece] = [piece(board, first), piece(board, second)];
  if (!firstPiece || !secondPiece || firstPiece === secondPiece || (first.row !== second.row && first.col !== second.col)) return false;

  swap(board, first, second);

  const checks = [
    checkMatch(board, first, secondPiece, true),
    checkMatch(board, second, firstPiece, true),
    checkMatch(board, first, secondPiece, false),
    checkMatch(board, second, firstPiece, false),
  ];

  swap(board, first, second);

  return checks.some(Boolean);
}

function swap<T>(board: Board<T>, first: Position, second: Position): void {
  [board.data[first.row][first.col], board.data[second.row][second.col]] = [board.data[second.row][second.col], board.data[first.row][first.col]];
}

function checkMatch<T>(board: Board<T>, position: Position, testPiece: T, isRow: boolean): boolean {
  const range = isRow ? [position.col - 2, position.col + 2] : [position.row - 2, position.row + 2];

  for (let i = range[0]; i <= range[1]; i++) {
    const positions = isRow ? [{ row: position.row, col: i }, { row: position.row, col: i + 1 }, { row: position.row, col: i + 2 }] :
      [{ row: i, col: position.col }, { row: i + 1, col: position.col }, { row: i + 2, col: position.col }];
    if (positions.every(pos => piece(board, pos) === testPiece)) return true;
  }

  return false;
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
  const effects: Effect<T>[] = [];

  if (canMove(board, first, second)) {
    swap(board, first, second);
    while (findMatches(board, effects)) {
      effects.push(doMatch(generator, board));
    }
  }
  return { board, effects };
}

function doMatch<T>(generator: Generator<T>, board: Board<T>): Effect<T> {
  board.matches.forEach(({ positions }) => positions.forEach(({ row, col }) => (board.data[row][col] = undefined)));
  board.matches = [];
  return doRefill(generator, board);
}

function findMatches<T>(board: Board<T>, effects: Effect<T>[]): boolean {
  let colMatch = false, rowMatch = false;

  for (let row = 0; row < board.height && (!colMatch || !rowMatch); row++) {
    for (let col = 0; col < board.width - 2 && (!colMatch || !rowMatch); col++) {
      rowMatch ||= findMatch(board, row, col, effects, true);
    }
  }

  for (let row = 0; row < board.height - 2 && (!rowMatch || !colMatch); row++) {
    for (let col = 0; col < board.width && (!rowMatch || !colMatch); col++) {
      colMatch ||= findMatch(board, row, col, effects, false);
    }
  }

  return rowMatch || colMatch;
}

function findMatch<T>(board: Board<T>, row: number, col: number, effects: Effect<T>[], isRow: boolean): boolean {
  const [p1, p2, p3] = isRow ? [piece(board, { row, col }), piece(board, { row, col: col + 1 }), piece(board, { row, col: col + 2 })] :
    [piece(board, { row, col }), piece(board, { row: row + 1, col }), piece(board, { row: row + 2, col })];

  if (p1 === p2 && p2 === p3 && p1 === p3) {
    const positions = isRow ? [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }] : [{ row, col }, { row: row + 1, col }, { row: row + 2, col }];
    const match = { matched: p1!, positions };
    effects.push({ kind: 'Match', match });
    board.matches.push(match);
    return true;
  }

  return false;
}

function doRefill<T>(generator: Generator<T>, board: Board<T>): Effect<T> {
  for (let col = 0; col < board.width; col++) {
    for (let row = board.height - 1; row >= 0; row--) {
      if (board.data[row][col] === undefined) {
        let index = row - 1;
        while (index >= 0 && board.data[index][col] === undefined) index--;
        if (index >= 0) [board.data[row][col], board.data[index][col]] = [board.data[index][col], undefined];
      }
    }
  }

  for (let col = 0; col < board.width; col++) {
    for (let row = 0; row < board.height; row++) {
      if (board.data[row][col] === undefined) board.data[row][col] = generator.next();
    }
  }

  return { kind: 'Refill', board };
}
