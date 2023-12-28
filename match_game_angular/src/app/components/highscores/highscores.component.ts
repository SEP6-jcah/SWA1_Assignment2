import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import User from '../../model/user';

@Component({
  selector: 'app-highscores',
  templateUrl: './highscores.component.html',
  styleUrls: ['./highscores.component.css']
})
export class HighscoresComponent {
  currentUser: User;
  highScores: Array<{ id: number; user: string; score: number; completed: boolean }>;
  top10HighScores: { id: number; user: string; score: number; completed: boolean; }[] | undefined;
  userHighScores: { id: number; user: string; score: number; completed: boolean; }[] | undefined;

  constructor(private authService: AuthService, private gameService: GameService) {
    this.currentUser = {} as User;
    this.highScores = [];
  }

  ngOnInit() {
    this.fetchHighScores();
  }

  async fetchHighScores() {
    try {
      this.currentUser = await this.authService.getCurrentUser();
      const allGames = await this.gameService.getAllGames();

      const filteredGames = allGames
        .filter((score: { score: number; completed: any }) => score.score > 0 && score.completed); // Only include non-zero scores and completed games

      const orderedHighScores = filteredGames.sort((a: any, b: any) => b.score - a.score); // Re-order highest to lowest

      this.top10HighScores = orderedHighScores.slice(0, 10);
    
      this.userHighScores = orderedHighScores
        .filter((score: { user: any }) => score.user === this.currentUser.id)
        .slice(0, 3); 
      
      } catch (error) {
      console.error('Failed to fetch high scores', error);
    }
  }
}
