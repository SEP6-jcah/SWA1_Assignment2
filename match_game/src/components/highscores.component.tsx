import React, { Component } from 'react';
import GameService from '../services/game.service';
import AuthService from '../services/auth.service';
import User from "../model/user";

type State = {
  currentUser: User;
  highScores: Array<{ id: number; user: string; score: number; completed: boolean }>;
};

class HighScores extends Component<{}, State> {

  constructor(props: {}) {
    super(props);
    this.state = {
      currentUser: {} as User,
      highScores: [],
    };
  }

  async componentDidMount() {
    try {
      const user = await AuthService.getCurrentUser();
      const allGames = await GameService.getAllGames();
      
      const filteredGames = allGames
        .filter((score: { score: number; completed: any; }) => score.score > 0 && score.completed); // Only include non-zero scores and completed games
  
      const orderedHighscores = filteredGames.sort((a: any, b: any) => b.score - a.score); // Re-order highest to lowest
  
      this.setState({ currentUser: user, highScores: orderedHighscores });
    } catch (error) {
      console.error('Failed to fetch high scores', error);
    }
  }

  render() {
    const { currentUser, highScores } = this.state;

    const top10HighScores = highScores.slice(0, 10);
    
    const userHighScores = highScores
      .filter((score: { user: any }) => score.user === currentUser.id)
      .slice(0, 3);

    return (
      <>
        <div className='jumbotron'>
          <div className='center'>
            <h1>High Scores</h1>
            <table className='table'>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {top10HighScores.map(score => (
                  <tr key={score.id}>
                    <td>{score.user}</td>
                    <td>{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='jumbotron'>
          <div className='center'>
            <h3><strong>{currentUser.username}</strong></h3>
            <table className='table'>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {userHighScores.map(score => (
                  <tr key={score.id}>
                    <td>{score.user}</td>
                    <td>{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}

export default HighScores;
