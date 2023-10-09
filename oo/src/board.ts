export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = ?;

export type BoardListener<T> = ?;

export class Board<T> {

    addListener(listener: BoardListener<T>) {
    }

    piece(p: Position): T | undefined {
    }

    canMove(first: Position, second: Position): boolean {
    }
    
    move(first: Position, second: Position) {
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
      var matches: Match<T>[]
      var current_piece

      // Checking rows for matches
      for (var row = 0; row < this.tiles.length; row++) {
          var length_of_match = 1

          for (var col = 0; col < this.tiles[row].length; col++) {
            var piece = this.tiles[row][col]

            if (piece === current_piece) {
              length_of_match++
            }
            else {
              if(current_piece !== undefined && length_of_match >= 3) {
                const match: Match<T> = {
                  matched: current_piece,
                  positions: []
                }

                for (var i = 0; i < length_of_match; i++) {
                  match.positions.push({ row, col: col - 1 })
                }

                matches.push(match)
              }

              current_piece = piece
              length_of_match = 1
            }
          }
      }

      // Checking columns for matches
      for (var col = 0; col < this.tiles[0].length; col++) {
        var length_of_match = 1

        // Top row has already been checked during the row check
        for (var row = 1; row < this.tiles[col].length; row++) {
          var piece = this.tiles[row][col]

          if (piece === current_piece) {
            length_of_match++
          }
          else {
            if(current_piece !== undefined && length_of_match >= 3) {
              const match: Match<T> = {
                matched: current_piece,
                positions: []
              }

              for (var i = 0; i < length_of_match; i++) {
                match.positions.push({ row: row - 1 - i, col })
              }

              matches.push(match)
            }

            current_piece = piece
            length_of_match = 1
          }
        }

        if (current_piece !== undefined && length_of_match >= 3) {
          const match: Match<T> = {
            matched: current_piece,
            positions: []
          }

          for (var i = 0; i < length_of_match; i++) {
            match.positions.push({ row: this.tiles.length -1 - i, col })
          }

          matches.push(match)
        }
      }

      return matches
    }
  
    private removeMatch(match: Match<T>): void {
      // Delete the matched pieces
      match.positions.forEach((pos) => {
        this.tiles[pos.row][pos.col] = undefined
      })

      for (var col = 0; col < this.tiles[0].length; col++) {
        for (var row = this.tiles.length - 1; row >= 0; row--) {
          if (this.tiles[row][col] === undefined) {
            var row_above = row - 1
            while (this.tiles[row_above][col] === undefined && row_above >= 0) {
              row_above--
            }

            if (row_above >= 0 ) {
              // Duplicate the piece from the row above down one tile
              this.tiles[row][col] = this.tiles[row_above][col]
              // Delete the original tile
              this.tiles[row_above][col] = undefined
            }
          }
        }
      }
    }
  
    private refill(): void {
      for (var col = 0; col < this.tiles[0].length; col++) {
        // Starting from the bottom row
        for (var row = this.tiles.length - 1; row >= 0; row--) {
          // Checking if the tile is empty
          if (this.tiles[row][col] === undefined) {
            // Shift pieces down from tile above
            for(var i = row; i > 0; i--) {
              this.tiles[i][col] = this.tiles[i - 1][col]
            }

            // this.tiles[0][col] = 
            // TODO: generate new piece on this tile
          }
        }
      }
      // Notify listeners about refill
      this.notify({ kind: 'Refill' });
    }
}


// export class Board<T> {
//   private tiles: T[][];
//   private listeners: BoardListener<T>[] = [];

//   constructor(rows: number, cols: number, generator: () => T) {
//     this.tiles = Array.from({ length: rows }, () =>
//       Array.from({ length: cols }, () => generator())
//     );
//   }