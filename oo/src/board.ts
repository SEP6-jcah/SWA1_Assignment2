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
    width: number;
    height: number;
    matches: Match<T>[];

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

        while (this.findMatches());
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
            }

            this.swap(first, second);
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
                    let positions = [position1, position2, position3];
                    let match = { matched: piece, positions }
                    this.matches.push(match);
                    this.notify({ kind: 'Match', match })

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
                    let positions = [position1, position2, position3];
                    this.matches.push({ matched: piece, positions });
                    this.notify({ kind: 'Match', match: { matched: piece, positions } })

                    return true;
                }
            }
        }

        return false;
    }

    move(first: Position, second: Position) {
        if (this.canMove(first, second)) {
            this.swap(first, second);
            while (this.findMatches()) { }
        }
    }

    private swap(first: Position, second: Position) {
        let firstPiece = this.piece(first);
        let seconfPiece = this.piece(second);

        this.board[first.row][first.col] = seconfPiece;
        this.board[second.row][second.col] = firstPiece;
    }

    private doMatch(match: Match<T>) {
        let position1 = match.positions[0];
        let position2 = match.positions[1];
        let position3 = match.positions[2];

        this.board[position1.row][position1.col] = undefined;
        this.board[position2.row][position2.col] = undefined;
        this.board[position3.row][position3.col] = undefined;

        this.notify({ kind: 'Refill' })
        this.doRefill();
    }

    private findMatches(): boolean {
        let colMatch = false;
        let rowMatch = false;

        for (let row = 0; row < this.height - 2; row++) {
            for (let col = 0; col < this.width - 2; col++) {
                colMatch = this.findMatchCol(row, col);
                rowMatch = this.findMatchRow(row, col);
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
            this.doMatch(match);

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
            this.doMatch(match);

            return true;
        }

        return false
    }

    private notify(event: BoardEvent<T>): void {
        this.listeners.forEach(listener => listener(event));
    }

    private doRefill() {

        for (let row = this.height - 1; row > 0; row--) {
            for (let col = 0; col < this.width; col++) {
                if (this.board[row][col] === undefined) {
                    this.board[row][col] = this.board[row - 1][col];
                    this.board[row - 1][col] = undefined;
                }
            }
        }

        for (let col = 0; col < this.width; col++) {
            if (this.board[0][col] === undefined)
                this.board[0][col] = this.generator.next();
        }

        while (this.findMatches());
    }

}