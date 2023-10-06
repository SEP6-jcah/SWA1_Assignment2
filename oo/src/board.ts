export type Generator<T> = {
  next: () => T;
};

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type BoardEvent<T> = {
  kind: 'Match';
  match: Match<T>;
} | {
  kind: 'Refill';
};

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export class Board<T> {
  private data: T[][];
  private readonly width: number;
  private readonly height: number;
  private readonly generator: Generator<T>;

  constructor(generator: Generator<T>, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.generator = generator;
    this.data = [];

    for (let row = 0; row < height; row++) {
      this.data.push([]);
      for (let col = 0; col < width; col++) {
        this.data[row].push(this.generator.next());
      }
    }
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  positions(): Position[] {
    const positions: Position[] = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        positions.push({ row, col });
      }
    }
    return positions;
  }

  piece(position: Position): T | undefined {
    const { row, col } = position;
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return undefined; // Position is out of bounds
    }
    return this.data[row][col];
  }

  canMove(from: Position, to: Position): boolean {
    const pieceFrom = this.piece(from);
    const pieceTo = this.piece(to);

    // Check if the positions are valid and not out of bounds
    if (pieceFrom === undefined || pieceTo === undefined) {
      return false;
    }

    // Check if the pieces are different and can be swapped
    if (pieceFrom === pieceTo) {
      return false;
    }

    // Check if the move is within the same row or the same column
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }

    // Temporarily swap pieces to check for matches
    this.data[from.row][from.col] = pieceTo;
    this.data[to.row][to.col] = pieceFrom;

    // Check for matches in the swapped positions
    const hasMatch =
      this.checkHorizontalMatch(from, pieceTo) ||
      this.checkVerticalMatch(from, pieceTo) ||
      this.checkHorizontalMatch(to, pieceFrom) ||
      this.checkVerticalMatch(to, pieceFrom);

    // Restore the original pieces
    this.data[from.row][from.col] = pieceFrom;
    this.data[to.row][to.col] = pieceTo;

    return hasMatch;
  }

  private checkHorizontalMatch(position: Position, piece: T): boolean {
    const { row, col } = position;

    for (let i = col - 2; i <= col + 2; i++) {
      if (
        i >= 0 &&
        i + 2 < this.width &&
        this.piece({ row, col: i }) === piece &&
        this.piece({ row, col: i + 1 }) === piece &&
        this.piece({ row, col: i + 2 }) === piece
      ) {
        return true;
      }
    }

    return false;
  }

  private checkVerticalMatch(position: Position, piece: T): boolean {
    const { row, col } = position;

    for (let i = row - 2; i <= row + 2; i++) {
      if (
        i >= 0 &&
        i + 2 < this.height &&
        this.piece({ row: i, col }) === piece &&
        this.piece({ row: i + 1, col }) === piece &&
        this.piece({ row: i + 2, col }) === piece
      ) {
        return true;
      }
    }

    return false;
  }
}


