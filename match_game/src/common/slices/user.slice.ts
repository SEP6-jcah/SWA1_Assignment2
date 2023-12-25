import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import User from '../../model/user'
import { RootState } from '../store';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: {} as User,
    token: "",  
  },
    reducers: {
      setUser: (state, action: PayloadAction<User>) => {
        state.currentUser = action.payload;
      },
      resetUser: (state) => {
        state.currentUser = {} as User;
      },
      setUserToken: (state, action: PayloadAction<string>) => {
        state.token = action.payload;
      },
  }
})

export const { setUser, resetUser, setUserToken } = userSlice.actions
export const user = (state: RootState) => state.user;

export default userSlice.reducer