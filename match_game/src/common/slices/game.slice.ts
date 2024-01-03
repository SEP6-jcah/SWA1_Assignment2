import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store';
import GameDTO from '../../model/gameDTO';

export const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentGame: {} as GameDTO,
    turns: 0
  },
    reducers: {
      setGame: (state, action: PayloadAction<GameDTO>) => {
        state.currentGame = action.payload;
      },
      resetGame: (state) => {
        state.currentGame = {} as GameDTO;
        state.turns = 0;
      },
      increaseScore: (state) => {
        state.currentGame.score += 1;
      },
      increaseTurns: (state) => {
        state.turns += 1;
      }

  }
})

export const { setGame, resetGame, increaseScore, increaseTurns } = gameSlice.actions
export const game = (state: RootState) => state.game.currentGame;

export default gameSlice.reducer