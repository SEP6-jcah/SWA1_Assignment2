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
    return pieceFrom !== pieceTo;
  }
}

