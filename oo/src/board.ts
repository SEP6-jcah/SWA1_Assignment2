export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = 
| { kind: 'Match'; match: Match<T> }
| { kind: 'Refill' };

export type BoardListener<T> = (event: BoardEvent<T>) => void;

class Board<T> {
    private tiles: T[][];
    private listeners: BoardListener<T>[] = [];
  
    constructor(rows: number, cols: number, generator: () => T) {
      this.tiles = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => generator())
      );
    }
  
    addListener(listener: BoardListener<T>): void {
      this.listeners.push(listener);
    }
  
    private notify(event: BoardEvent<T>): void {
      this.listeners.forEach(listener => listener(event));
    }
  
    piece(position: Position): T | undefined {
      return this.tiles[position.row]?.[position.col];
    }
  
    canMove(position1: Position, position2: Position): boolean {
      const piece1 = this.piece(position1);
      const piece2 = this.piece(position2);
  
      if (piece1 === undefined || piece2 === undefined) {
        return false;
      }
  
      if (
        position1.row === position2.row ||
        position1.col === position2.col
      ) {
        // Perform a hypothetical swap
        const tempPiece = piece1;
        this.tiles[position1.row][position1.col] = piece2;
        this.tiles[position2.row][position2.col] = tempPiece;
  
        // Check if the swap creates any matches
        const matches = this.findMatches();
  
        // Undo the swap
        this.tiles[position2.row][position2.col] = piece1;
        this.tiles[position1.row][position1.col] = tempPiece;
  
        return matches.length > 0;
      }
  
      return false;
    }
  
    move(position1: Position, position2: Position): void {
      if (this.canMove(position1, position2)) {
        // Perform the actual swap
        const piece1 = this.tiles[position1.row][position1.col];
        const piece2 = this.tiles[position2.row][position2.col];
        this.tiles[position1.row][position1.col] = piece2;
        this.tiles[position2.row][position2.col] = piece1;
  
        // Find and remove matches
        const matches = this.findMatches();
        matches.forEach(match => this.removeMatch(match));
  
        // Notify listeners about matches
        matches.forEach(match => this.notify({ kind: 'Match', match }));
  
        // Refill the board
        this.refill();
      }
    }
  
    private findMatches(): Match<T>[] {
      // Logic to find matches here...
    }
  
    private removeMatch(match: Match<T>): void {
      // Logic to remove matches here...
    }
  
    private refill(): void {
      // Logic to refill the board here...
      // Notify listeners about refill
      this.notify({ kind: 'Refill' });
    }
  }
  
  
  
  
  
  
