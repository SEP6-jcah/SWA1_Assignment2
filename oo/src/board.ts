export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {

}

export type BoardListener<T> = {

}

export class Board<T> {

    board: (T | undefined)[][];
    listeners: BoardListener<T>[] = [];
    generator: Generator<T>;
    width: number;
    height: number;

    constructor(generator: Generator<T>, width:number , height: number){
        this.generator = generator;
        this.width = width;
        this.height = height;
        this.board = [];

        for (let row = 0; row < height; row++) {
            this.board.push([]);
            for (let col = 0; col < width; col++) {
              this.board[row].push(this.generator.next());
            }
        }
    }
    
    positions() : Position[]{
        var positionsToReturn:Position[] = [];
        for(let row = 0; row < this.height; row++)
        {
            for(let col = 0; col < this.width; col++)
            {
                positionsToReturn.push({row,col});
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

        if (p.row < this.height && p.col < this.width ){
            return this.board[p.row][p.col];
        }
        return undefined;
    }

    canMove(first: Position, second: Position): boolean {
        let firstPiece = this.piece(first);
        let secondPiece = this.piece(second);

        if(firstPiece === undefined || secondPiece === undefined || firstPiece === secondPiece)
            return false;

        if (first.col === second.col || first.row === second.row)
        {
            this.swap(first, second);

            let check1 = this.checkColumnMatch(first,secondPiece);
            let check2 = this.checkColumnMatch(second, firstPiece);
            let check3 = this.checkRowMatch(first,secondPiece);
            let check4 = this.checkRowMatch(second, firstPiece);

            if (check1 || check2 || check3 || check4)
            {
                this.swap(first, second);
                return true;
            }
        }

        return false;
    }

    private checkColumnMatch(position:Position, piece:T):boolean{
        let col = position.col;
        let row = position.row;

        for(let i = col - 2; i < col +2; i++)
        {
            if (i >= 0 && i+2 <= this.width)
            {
                let piece1 = this.piece({row, col:i});
                let piece2 = this.piece({row, col:i+1});
                let piece3 = this.piece({row, col:i+2});

                if (piece1 === piece && piece2 === piece && piece3 === piece)
                    return true;
            }
        }

        return false;
    }

    private checkRowMatch(position:Position, piece:T):boolean{
        let col = position.col;
        let row = position.row;

        for(let i = row - 2; i < row +2; i++)
        {
            if (i >= 0 && i+2 <= this.height)
            {
                let piece1 = this.piece({row:i, col});
                let piece2 = this.piece({row:i+1, col});
                let piece3 = this.piece({row:i+2, col});

                if (piece1 === piece && piece2 === piece && piece3 === piece)
                    return true;
            }
        }

        return false;
    }
    
    move(first: Position, second: Position) {
        if(this.canMove(first, second)){
            this.swap(first, second);
        }
    }

    private swap(first:Position, second:Position){
        let firstPiece = this.piece(first);
        let seconfPiece = this.piece(second);

        this.board[first.row][first.col] = seconfPiece;
        this.board[second.row][second.col] = firstPiece;
    }
}
