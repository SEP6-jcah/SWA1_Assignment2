import React, { Component } from 'react';
import { Board, BoardEvent, Match, Position } from '../model/oo/board';
import GameService from '../services/game.service';
import GameDTO from '../model/gameDTO'
import { RootState } from '../common/store';
import { connect } from 'react-redux';
import { game, increaseScore, increaseTurns, setGame } from '../common/slices/game.slice';

type Props = {
  setGame: (game: GameDTO) => void;
  increaseScore: () => void;
  increaseTurns: () => void;
  currentGame: GameDTO;
  turns: number;
};

type State = {
  board: Board<string> | null;
  selectedPosition: Position | null;
  isGameOver: boolean;
};

class Game extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      board: null,
      selectedPosition: null,
      isGameOver: false,
    };
  }

  async componentDidMount() {    
    const game: GameDTO = await GameService.startNewGame();
    this.props.setGame(game)
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
        this.props.increaseScore();
        console.log(`Match event: matched ${event.match.matched} at positions ${JSON.stringify(event.match.positions)}`);
      } else if (event.kind === 'Refill') {
        console.log('Refill event');
        this.props.increaseTurns();
        if (this.isGameOver()) {
          this.setState({ isGameOver: true });
          this.props.setGame({
            ...this.props.currentGame,
            completed: true
          })
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

    if (isGameOver && this.props.currentGame) {
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
    return this.props.turns >= 5;
  }

  render() {
    const { board, selectedPosition, isGameOver} = this.state;
    const { currentGame } = this.props; 

    return (
      <div className='center'>
        <h1>Match 3</h1>
        <h4>Score: {currentGame.score}</h4>
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
    const { currentGame } = this.props; 

    try {
      if(currentGame) {
        await GameService.updateGame(currentGame);
        console.log('Game updated: ', currentGame)
      }
    } catch (error) {
      console.error('Failed to update game', error);
    }
  }
  
}

const mapDispatchToProps = {
  setGame,
  increaseScore,
  increaseTurns,
};

const mapStateToProps = (state: RootState) => {
  return{
    currentGame: state.game.currentGame as GameDTO,
    turns: state.game.turns as number,
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
