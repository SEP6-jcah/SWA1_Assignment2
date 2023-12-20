const API_URL = 'http://localhost:9090';

class GameService {


  async getAllGames(token: string): Promise<any> {
    const response = await fetch(`${API_URL}/games?token=${token}`);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch games');
    }
  }

  async startNewGame(token: string): Promise<any> {
    const response = await fetch(`${API_URL}/games?token=${token}`, {
      method: 'POST',
    });
    if (response.ok) {
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

  async updateGame(token: string, gameId: string, update: any): Promise<void> {
    const response = await fetch(`${API_URL}/games/${gameId}?token=${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to update game');
    }
  }
}

export default new GameService();
