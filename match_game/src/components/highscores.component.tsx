import React, { Component } from 'react';
import GameService  from '../services/game.service';

interface HighScoresState {
    highScores: Array<{ id: number; user: string; score: number }>;
  }
  
  class HighScores extends Component<{}, HighScoresState> {
  
    constructor(props: {}) {
      super(props);
      this.state = {
        highScores: [],
      };
    }
  
    async componentDidMount() {
      try {
        const { userId, token } = JSON.parse(sessionStorage.user);
        const scores = await GameService.getAllGames(token);
        this.setState({ highScores: scores });
      } catch (error) {
        console.error('Failed to fetch high scores', error);
      }
    }
  
    render() {
      const { highScores } = this.state;
  
      return (
        <div>
          <h1>High Scores</h1>
          <ul>
            {highScores.map((game) => (
              <li key={game.id}>
                {game.user}: {game.score}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
  
  export default HighScores;
