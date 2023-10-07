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

        if (first.col == second.col)
        {
            let dif = first.row - second.row;
            if (dif == 1 || dif == -1)
                return true;
        }
        else if (first.row == second.row){
            let dif = first.col - first.col;
            if (dif == 1 || dif == -1)
                return true;
        }

        return false;
    }
    
    move(first: Position, second: Position) {
    }
}
