import React, { Component } from 'react';
import { Board, BoardEvent, Match, Position } from '../model/oo/board';
import GameService from '../services/game.service';
import GameDTO from '../model/gameDTO'

type Props = {};

type State = {
  game: GameDTO | null,
  score: number;
  board: Board<string> | null;
  selectedPosition: Position | null;
  turns: number;
  isGameOver: boolean;
};

class Game extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      game: null,
      score: 0,
      board: null,
      selectedPosition: null,
      turns: 0,
      isGameOver: false,
    };
  }

  async componentDidMount() {    
    this.setState({ game: await GameService.startNewGame() });
    this.initializeGame();
  }

  async initializeGame() {
    const createGenerator = () => {
      const pieces = ['A', 'B', 'C', 'D'];
      return {
        next: () => pieces[Math.floor(Math.random() * pieces.length)],
      };
    };

    const generator = createGenerator();
    const newBoard = new Board(generator, 5, 5);
    this.setState({ board: newBoard });

    const handleBoardEvent = (event: BoardEvent<string>) => {
      if (event.kind === 'Match') {
        this.setState((prevState) => ({ score: prevState.score + 1 }));
        console.log(`Match event: matched ${event.match.matched} at positions ${JSON.stringify(event.match.positions)}`);
      } else if (event.kind === 'Refill') {
        console.log('Refill event');
        this.setState((prevState) => ({ turns: prevState.turns + 1 }));
        if (this.isGameOver()) {
          this.setState({ isGameOver: true });
          this.state.game!.completed = true;
        }
      }
    };

    newBoard.addListener(handleBoardEvent);

    // Clean up the event listener on component unmount
    return () => {
      if (newBoard) {
        newBoard.listeners = newBoard.listeners.filter(
          (listener) => listener !== handleBoardEvent
        );
      }
    };
  }

  handleBoardClick = (position: Position): void => {
    const { selectedPosition, board, isGameOver } = this.state;

    if (isGameOver && this.state.game) {
      return;
    }

    if (!selectedPosition) {
      this.setState({ selectedPosition: position });
    } else {
      board?.move(selectedPosition, position);
      this.setState({ selectedPosition: null });
    }
  };

  isGameOver(): boolean {
    // Check if the number of turns reaches 5
    return this.state.turns >= 5;
  }

  render() {
    const { score, board, selectedPosition, isGameOver} = this.state;

    return (
      <div className='center'>
        <h1>Match 3</h1>
        <h4>Score: {score}</h4>
        {board && !isGameOver && (
          <div className='jumbotron'>
            {Array.from({ length: board.height }).map((_, row) => (
              <div key={row} className="board-row">
                {Array.from({ length: board.width }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => this.handleBoardClick({ row, col })}
                    className={`board-cell ${selectedPosition?.row === row && selectedPosition?.col === col ? 'selected' : ''}`}
                  >
                    {board.piece({ row, col })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {isGameOver && <><br/><br/><h1 style={{ color: "red" }}>Game Over!</h1></>}
      </div>
    );
  }

  async componentWillUnmount(){
    try {
      if(this.state.game) {
        this.state.game.score = this.state.score;
        await GameService.updateGame(this.state.game!);
        console.log('Game updated: ', this.state.game!)
      }
    } catch (error) {
      console.error('Failed to update game', error);
    }
  }
  
}

export default Game;
