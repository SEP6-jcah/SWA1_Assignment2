export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}    

export type Match<T> = {
    matched: string,
    positions: Position[]
}    

export type Board<T> = {
  data: (T | undefined)[][];
  generator: Generator<T>;
  matches: Match<T>[];
  width: number;
  height: number;
};

export type Effect<T> = {
  kind: 'Match';
  match: Match<T>;
} | {
  kind: 'Refill';
};

export type MoveResult<T> = {
  board: Board<T>;
  effects: Effect<T>;
};

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
    const firstPiece = piece(board, first);
    const secondPiece = piece(board, second);
  
    if (firstPiece === undefined || secondPiece === undefined || firstPiece === secondPiece){    
      return false;
    }
  
    if (first.row === second.row || first.col === second.col) {
      swap(board, first, second);
  
      const check1 = checkColumnMatch(board, first, secondPiece);
      const check2 = checkColumnMatch(board, second, firstPiece);
      const check3 = checkRowMatch(board, first, secondPiece);
      const check4 = checkRowMatch(board, second, firstPiece);
  
      swap(board, first, second);
  
      if (check1 || check2 || check3 || check4) {
        return true;
      }
    }
  
    return false;
  }
  

function swap<T>(board: Board<T>, first: Position, second: Position): void {
  const firstPiece = piece(board, first);
  const secondPiece = piece(board, second);

  board.data[first.row][first.col] = secondPiece;
  board.data[second.row][second.col] = firstPiece;
}

function checkColumnMatch<T>(board: Board<T>, position: Position, testPiece: T): boolean {
  const col = position.col;
  const row = position.row;

  for (let i = col - 2; i <= col + 2; i++) {
    if (i >= 0 && i + 2 < board.width) {
      const position1: Position = { row, col: i };
      const position2: Position = { row, col: i + 1 };
      const position3: Position = { row, col: i + 2 };

      const piece1 = piece(board, position1);
      const piece2 = piece(board, position2);
      const piece3 = piece(board, position3);

      if (piece1 === testPiece && piece2 === testPiece && piece3 === testPiece) {
        return true;
      }
    }
  }

  return false;
}

function checkRowMatch<T>(board: Board<T>, position: Position, testPiece: T): boolean {
  const col = position.col;
  const row = position.row;

  for (let i = row - 2; i <= row + 2; i++) {
    if (i >= 0 && i + 2 < board.height) {
      const position1: Position = { row: i, col };
      const position2: Position = { row: i + 1, col };
      const position3: Position = { row: i + 2, col };

      const piece1 = piece(board, position1);
      const piece2 = piece(board, position2);
      const piece3 = piece(board, position3);

      if (piece1 === testPiece && piece2 === testPiece && piece3 === testPiece) {
        return true;
      }
    }
  }

  return false;
}


export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
  // Initialize an array to store the effects
  let effects: Effect<T> = {kind: 'Refill'}

  if (!canMove(board, first, second)) {
    return { board, effects};
  }

  
  // Perform the move
  const updatedBoard = { ...board };
  swap(updatedBoard, first, second);
  
  
  // While there are matches, keep performing them
  while (updatedBoard.matches.length > 0) {
    doMatch(updatedBoard, effects);
  }
  
  return {board, effects}
}

function doMatch<T>(board: Board<T>, effects: Effect<T>): MoveResult<T>  {
  for (const match of board.matches) {
    for (const position of match.positions) {
      // Clear the piece from the board
      board.data[position.row][position.col] = undefined;
    }

    // Add the match effect to the effects array
    effects = {
      kind: 'Match',
      match: { matched: match.matched, positions: match.positions }
    };
  }

  // Clear the matches from the board
  board.matches = [];

  // Notify the refill event
 // effects = { kind: 'Refill' };
  //doRefill(board, effects);
}

function doRefill<T>(board: Board<T>, effects: Effect<T>) {
  for (let col = 0; col < board.width; col++) {
    let bottomRow = board.height - 1;

    for (let row = board.height - 2; row >= 0; row--) {
      if (board.data[row][col] !== undefined) {
        while (bottomRow > row && board.data[bottomRow][col] === undefined) {
          // Move the tile down as far as possible
          board.data[bottomRow][col] = board.data[row][col];
          board.data[row][col] = undefined;
          bottomRow--;
        }
      }
    }
  }

  // Refill any empty cells with new pieces
  for (let col = 0; col < board.width; col++) {
    for (let row = 0; row < board.height; row++) {
      if (board.data[row][col] === undefined) {
        // Generate a new piece using the generator
        const newPiece = board.generator.next();

        // Fill the empty cell with the new piece
        board.data[row][col] = newPiece;

        // Add a Refill effect for the new piece at the specified position
        effects = {
          kind: 'Refill'
        };
      }
    }
  }
}

function findMatches(board: Board<T>): boolean {
  let colMatch = false;
  let rowMatch = false;
  let height = board.height
  let width = board.width

  for (let row = 0; row < height; row++) {
      for (let col = 0; col < width - 2; col++) {
          if (!colMatch) {
              colMatch = this.findMatchCol(row, col);
          }
      }
  }

  for (let row = 0; row < this.height - 2; row++) {
      for (let col = 0; col < this.width; col++) {
          if (!rowMatch) {
              rowMatch = this.findMatchRow(row, col);
          }
      }
  }

  return colMatch || rowMatch;
}



