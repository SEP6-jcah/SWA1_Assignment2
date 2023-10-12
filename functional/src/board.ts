export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}    

export type Match<T> = {
    matched: T,
    positions: Position[]
}    

export type Board<T> = {
  data: (T | undefined)[][];
  generator: Generator<T>;
  matches: Match<T>[];
  width: number;
  height: number;
};

export type Effect<T> = {}


export type MoveResult<T> = {}    

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {
  const board: Board<T> = {
    data: [],
    generator: generator,
    matches: [],
    width: width,
    height: height
  };
  
  for (let row = 0; row < height; row++) {
    board.data[row] = new Array(width);
    for (let col = 0; col < width; col++) {
      board.data[row][col] = generator.next();
    }
  }
  
  return board;
}

export function positions<T>(board: Board<T>): Position[] {
  const positions: Position[] = [];
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        positions.push({ row, col });
      }
    }
  return positions;
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  const { row, col } = p;

  if (row >= 0 && row < board.height && col >= 0 && col < board.width) {
    return board.data[row][col];
  }

  return undefined;
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
}