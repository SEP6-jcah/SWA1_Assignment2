export type Generator<T> = { next: () => T }

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type Refill = {

}

export type BoardEvent<T> = {
    kind: 'Match';
    match: Match<T>;
} | {
    kind: 'Refill';
};

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export class Board<T> {

    board: (T | undefined)[][];
    listeners: BoardListener<T>[] = [];
    generator: Generator<T>;
    matches: Match<T>[];
    width: number;
    height: number;

    constructor(generator: Generator<T>, width: number, height: number) {
        this.generator = generator;
        this.width = width;
        this.height = height;
        this.board = [];
        this.matches = [];

        for (let row = 0; row < height; row++) {
            this.board.push([]);
            for (let col = 0; col < width; col++) {
                this.board[row].push(this.generator.next());
            }
        }
        //We check for Matches after generating, might be a problem but tests don't show anything wrong
        while (this.findMatches()) {
            this.doMatch();
        };
    }

    positions(): Position[] {
        var positionsToReturn: Position[] = [];

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                positionsToReturn.push({ row, col });
            }
        }

        return positionsToReturn;
    }

    addListener(listener: BoardListener<T>) {
        this.listeners.push(listener);
    }

    piece(p: Position): T | undefined {
        if (p.row < 0 || p.col < 0)
            return undefined;

        if (p.row < this.height && p.col < this.width) {
            return this.board[p.row][p.col];
        }

        return undefined;
    }

    canMove(first: Position, second: Position): boolean {
        let firstPiece = this.piece(first);
        let secondPiece = this.piece(second);

        if (firstPiece === undefined || secondPiece === undefined || firstPiece === secondPiece)
            return false;

        if (first.col === second.col || first.row === second.row) {
            this.swap(first, second);

            let check1 = this.checkColumnMatch(first, secondPiece);
            let check2 = this.checkColumnMatch(second, firstPiece);
            let check3 = this.checkRowMatch(first, secondPiece);
            let check4 = this.checkRowMatch(second, firstPiece);

            if (check1 || check2 || check3 || check4) {
                this.swap(first, second);
                return true;
            } else {
                this.swap(first, second);
            }


        }

        return false;
    }

    private checkColumnMatch(position: Position, piece: T): boolean {
        let col = position.col;
        let row = position.row;

        for (let i = col - 2; i <= col + 2; i++) {
            if (i >= 0 && i + 2 < this.width) {
                let position1 = { row, col: i };
                let position2 = { row, col: i + 1 };
                let position3 = { row, col: i + 2 };

                let piece1 = this.piece(position1);
                let piece2 = this.piece(position2);
                let piece3 = this.piece(position3);

                if (piece1 === piece && piece2 === piece && piece3 === piece) {
                    //let positions = [position1, position2, position3];
                    //let match = { matched: piece, positions }
                    //this.notify({ kind: 'Match', match: match })
                    //this.doMatch(match);

                    return true;
                }
            }
        }

        return false;
    }

    private checkRowMatch(position: Position, piece: T): boolean {
        let col = position.col;
        let row = position.row;

        for (let i = row - 2; i <= row + 2; i++) {
            if (i >= 0 && i + 2 < this.height) {
                let position1 = { row: i, col };
                let position2 = { row: i + 1, col };
                let position3 = { row: i + 2, col };

                let piece1 = this.piece(position1);
                let piece2 = this.piece(position2);
                let piece3 = this.piece(position3);

                if (piece1 === piece && piece2 === piece && piece3 === piece) {
                    //let positions = [position1, position2, position3];
                    //let match = { matched: piece, positions }
                    //this.notify({ kind: 'Match', match: match })
                    //this.doMatch(match);

                    return true;
                }
            }
        }

        return false;
    }

    move(first: Position, second: Position) {
        if (this.canMove(first, second)) {
            this.swap(first, second);
            while (this.findMatches()) {
                this.doMatch();
            }
        }
    }

    private swap(first: Position, second: Position) {
        let firstPiece = this.piece(first);
        let seconfPiece = this.piece(second);

        this.board[first.row][first.col] = seconfPiece;
        this.board[second.row][second.col] = firstPiece;
    }

    private doMatch() {
        this.matches.forEach(match => {
            let position1 = match.positions[0];
            let position2 = match.positions[1];
            let position3 = match.positions[2];

            this.board[position1.row][position1.col] = undefined;
            this.board[position2.row][position2.col] = undefined;
            this.board[position3.row][position3.col] = undefined;
        });

        this.matches = [];

        this.notify({ kind: 'Refill' })
        this.doRefill();
    }

    private findMatches(): boolean {
        let colMatch = false;
        let rowMatch = false;

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width - 2; col++) {
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

    private findMatchCol(row: number, col: number): boolean {
        let position1 = { row, col: col };
        let position2 = { row, col: col + 1 };
        let position3 = { row, col: col + 2 };

        let piece1 = this.piece(position1);
        let piece2 = this.piece(position2);
        let piece3 = this.piece(position3);

        if (piece1 === piece2 && piece2 === piece3 && piece1 === piece3) {
            let positions = [position1, position2, position3];
            let match = { matched: piece1, positions }

            this.notify({ kind: 'Match', match })
            this.matches.push(match);


            return true;
        }

        return false;
    }

    private findMatchRow(row: number, col: number): boolean {
        let position1 = { row: row, col };
        let position2 = { row: row + 1, col };
        let position3 = { row: row + 2, col };

        let piece1 = this.piece(position1);
        let piece2 = this.piece(position2);
        let piece3 = this.piece(position3);

        if (piece1 === piece2 && piece2 === piece3 && piece1 === piece3) {
            let positions = [position1, position2, position3];
            let match = { matched: piece1, positions }

            this.notify({ kind: 'Match', match })
            this.matches.push(match);

            return true;
        }

        return false
    }

    private notify(event: BoardEvent<T>): void {
        this.listeners.forEach(listener => listener(event));
    }

    private doRefill() {

        for (let col = 0; col < this.width; col++) {
            for (let row = this.height - 1; row >= 0; row--) {
                if (this.board[row][col] === undefined) {
                    // If the current cell is empty
                    let index = row - 1;

                    while (index >= 0 && this.board[index][col] === undefined) {
                        index--;
                    }

                    if (index >= 0) {
                        // Move the tile down
                        this.board[row][col] = this.board[index][col];
                        this.board[index][col] = undefined;
                    }
                }
            }
        }
            for (let col = 0; col < this.width; col++) {
                    for(let row = 0;row<this.height;row++){
                        if (this.board[row][col] === undefined) {
                            this.board[row][col] = this.generator.next();
                        }
                    }
                }
    }
}