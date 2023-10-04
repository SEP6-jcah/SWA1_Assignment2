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
    private board: (T | undefined)[][];
    private listeners: BoardListener<T>[] = [];
    private generator: Generator<T>;
    private width: number;
    private height: number;
  
    constructor(generator: Generator<T>, width: number, height: number) {
      this.generator = generator;
      this.width = width;
      this.height = height;
      this.board = this.initializeBoard();
    }
  
    private initializeBoard(): (T | undefined)[][] {
      return Array.from({ length: this.height }, () =>
        Array.from({ length: this.width }, () => undefined)
      );
    }
  
    addListener(listener: BoardListener<T>) {
      this.listeners.push(listener);
    }
  
    piece(p: Position): T | undefined {
      if (this.isPositionValid(p)) {
        return this.board[p.row][p.col];
      }
      return undefined;
    }
  
    canMove(first: Position, second: Position): boolean {
      if (!this.isPositionValid(first) || !this.isPositionValid(second)) {
        return false;
      }
  
      const tileA = this.board[first.row][first.col];
      const tileB = this.board[second.row][second.col];
  
      if (this.arePositionsAdjacent(first, second) && tileA === tileB) {
        return true;
      }
  
      return false;
    }
  
    move(first: Position, second: Position) {
        if (!this.canMove(first, second)) {
            return;
        }
    
        let hasMatches = false;
    
        do {
            hasMatches = false;
    
            const temp = this.board[first.row][first.col];
            this.board[first.row][first.col] = this.board[second.row][second.col];
            this.board[second.row][second.col] = temp;
    
            let matchingTile = this.board[first.row][first.col];
            const horizontalMatch = this.checkHorizontalMatch(first, matchingTile);
            const verticalMatch = this.checkVerticalMatch(first, matchingTile);
    
            if (horizontalMatch) {
                this.notify({
                    kind: 'Match',
                    match: { matched: matchingTile, positions: horizontalMatch },
                });
                hasMatches = true;
            }
    
            if (verticalMatch) {
                this.notify({
                    kind: 'Match',
                    match: { matched: matchingTile, positions: verticalMatch },
                });
                hasMatches = true;
            }
    
            if (hasMatches) {
                const refillNeeded = this.checkRefillNeeded();
    
                if (refillNeeded) {
                    this.refillBoard();
                    this.notify({ kind: 'Refill' });
                }
            }
        } while (hasMatches);
    }
    
    
  
    private arePositionsAdjacent(first: Position, second: Position): boolean {
      const rowDiff = Math.abs(first.row - second.row);
      const colDiff = Math.abs(first.col - second.col);
      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
  
    private isPositionValid(p: Position): boolean {
      return p.row >= 0 && p.row < this.height && p.col >= 0 && p.col < this.width;
    }
  
    private checkHorizontalMatch(position: Position, tile: T): Position[] | undefined {
      const matches: Position[] = [];
      const row = position.row;
      const col = position.col;
  
      let left = col - 1;
      while (left >= 0 && this.board[row][left] === tile) {
        matches.push({ row, col: left });
        left--;
      }
  
      let right = col + 1;
      while (right < this.width && this.board[row][right] === tile) {
        matches.push({ row, col: right });
        right++;
      }
  
      matches.push(position);
  
      if (matches.length >= 3) {
        return matches;
      }
  
      return undefined;
    }
  
    private checkVerticalMatch(position: Position, tile: T): Position[] | undefined {
      const matches: Position[] = [];
      const row = position.row;
      const col = position.col;
  
      let above = row - 1;
      while (above >= 0 && this.board[above][col] === tile) {
        matches.push({ row: above, col });
        above--;
      }
  
      let below = row + 1;
      while (below < this.height && this.board[below][col] === tile) {
        matches.push({ row: below, col });
        below++;
      }
  
      matches.push(position);
  
      if (matches.length >= 3) {
        return matches;
      }
  
      return undefined;
    }
  
    private checkRefillNeeded(): boolean {
      for (let col = 0; col < this.width; col++) {
        for (let row = this.height - 1; row >= 0; row--) {
          if (!this.board[row][col]) {
            return true;
          }
        }
      }
      return false;
    }
  
    private refillBoard() {
      for (let col = 0; col < this.width; col++) {
        const missingTiles: T[] = [];
        for (let row = this.height - 1; row >= 0; row--) {
          if (!this.board[row][col]) {
            const newTile = this.generator.next();
            missingTiles.push(newTile);
          }
        }
  
        let row = this.height - 1;
        while (missingTiles.length > 0) {
          if (!this.board[row][col]) {
            this.board[row][col] = missingTiles.pop()!;
          }
          row--;
        }
      }
    }
  
    private notify(event: BoardEvent<T>) {
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }

