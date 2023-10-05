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

export type BoardEvent<T> =
      { kind: 'Match'; match: Match<T> }
    | { kind: 'Refill' };

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export class Board<T> {
    private board: T [][];
    private listeners: BoardListener<T>[] = [];
    private generator: Generator<T>;
    width: number;
    height: number;

    constructor(generator: Generator<T>, width: number, height: number) {
        this.generator = generator;
        this.width = width;
        this.height = height;
        this.board = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => undefined)
        );;
    }

    addListener(listener: BoardListener<T>) {
        this.listeners.push(listener);
    }
    //TODO: Remember to do a 2D array properly
    positions(): Position[] {
        const matches: Position[] = [];
        for (let row = 0; row < this.width; row++)
            for (let col = this.height - 1; col >= 0; col--)
                matches.push({ row: row, col:col})
        return matches;
    }
    private notify(event: BoardEvent<T>) {
        for (const listener of this.listeners) {
            listener(event);
        }
    }
    piece(p: Position): T | undefined {
            return this.board[p.row][p.col];
    }

    canMove(origin : Position, target  : Position): boolean {
        const a = this.board[origin.row][origin.col];
        const b = this.board[target.row][target.col];

        //Don't know what Math.abs returns with undefined values but don't want to find out
        if (a === undefined || b === undefined) {
            return false;
        }
        if (this.isAdjacent(origin, target) && a === b) {
            return true;
        }
        return false;
    }

    move(origin : Position, target  : Position) {
        if (!this.canMove(origin, target)) {
            return;
        }

        let matched= false;

        do {

            matched = false;
            const temp = this.board[origin.row][origin.col];
            this.board[origin.row][origin.col] = this.board[target.row][target.col];
            this.board[target.row][target.col] = temp;

            let matchingTarget = this.board[origin.row][origin.col];
            const horizontalMatch = this.HorizontalMatch(origin , matchingTarget);
            const verticalMatch = this.VerticalMatch(origin , matchingTarget);

            if (horizontalMatch) {
                this.notify({kind: 'Match', match: { matched: matchingTarget, positions: horizontalMatch },});
                matched= true;
            }

            if (verticalMatch) {
                this.notify(
                    {kind: 'Match', match: { matched: matchingTarget, positions: verticalMatch },});
                matched = true;
            }

            if (matched) {
                const refillNeeded = this.checkRefill();

                if (refillNeeded) {
                    this.refill();
                    this.notify({ kind: 'Refill' });
                }
            }
        } while (matched);
    }
    
    private isAdjacent(origin : Position, target  : Position): boolean {
        return (Math.abs(origin.row - target.row) === 1 && Math.abs(origin.col - target.col) === 0)
            || (Math.abs(origin.row - target.row) === 0 && Math.abs(origin.col - target.col) === 1);
    }


    private HorizontalMatch(position: Position, tile: T): Position[] | undefined {
        const matches: Position[] = [];
        const row = position.row;
        const col = position.col;

        // Check to the left of the current position
        let left = col - 1;
        while (left >= 0 && this.board[row][left] === tile) {
            matches.push({ row, col: left });
            left--;
        }

        // Check to the right of the current position
        let right = col + 1;
        while (right < this.width && this.board[row][right] === tile) {
            matches.push({ row, col: right });
            right++;
        }

        // Include the current position in the matches
        matches.push(position);

        // Check if a match of 4 or more is found (changed from 3 to 4)
        if (matches.length > 3)
            return matches;

            return undefined; // No valid match found
    }

    private VerticalMatch(position: Position, tile: T): Position[] | undefined {
        const matches: Position[] = [];
        const row = position.row;
        const col = position.col;

        // Check above the current position
        let above = row - 1;
        while (above >= 0 && this.board[above][col] === tile) {
            matches.push({ row: above, col });
            above--;
        }

        // Check below the current position
        let below = row + 1;
        while (below < this.height && this.board[below][col] === tile) {
            matches.push({ row: below, col });
            below++;
        }

        // Include the current position in the matches
        matches.push(position);

        // Check if a match of 3 or more is found
        if (matches.length >= 3)
            return matches;

            return undefined; // No valid match found

    }

    private checkRefill(): boolean {
        for (let col = 0; col < this.width; col++) 
            for (let row = this.height - 1; row >= 0; row--) 
                if (!this.board[row][col]) 
                    return true;
        return false;
    }

    private refill() {
        for (let col = 0; col < this.width; col++) {
            const missing: T[] = [];
            for (let row = this.height - 1; row >= 0; row--) {
                if (!this.board[row][col]) {
                    const newTile = this.generator.next();
                    missing.push(newTile);
                }
            }
            let row = this.height - 1;
            while (missing.length > 0) {
                if (!this.board[row][col])
                    this.board[row][col] = missing.pop()!;
                row--;
            }
        }
    }

}