import GameDTO from "../model/gameDTO";

const API_URL = 'http://localhost:9090';

class GameService {


  async getAllGames(): Promise<any> {
    const { userId, token } = JSON.parse(sessionStorage.user);

    const response = await fetch(`${API_URL}/games?token=${token}`);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch games');
    }
  }

  async startNewGame(): Promise<any> {
    const { userId, token } = JSON.parse(sessionStorage.user);

    const response = await fetch(`${API_URL}/games?token=${token}`, {
      method: 'POST',
    });
    if (response.status === 201) {
      return response.json();
    } else {
      throw new Error('Failed to start a new game');
    }
  }

  async getGameDetails(token: string, gameId: string): Promise<any> {
    
    const response = await fetch(`${API_URL}/games/${gameId}?token=${token}`);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch game details');
    }
  }

  async updateGame(game: GameDTO): Promise<void> {
    const { userId, token } = JSON.parse(sessionStorage.user);

    const response = await fetch(`${API_URL}/games/${game.id}?token=${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });

    if (!response.ok) {
      throw new Error('Failed to update game');
    }
  }
}

export default new GameService();
