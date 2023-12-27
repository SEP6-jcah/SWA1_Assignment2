import { Component, OnDestroy, OnInit } from '@angular/core';

import { Board, BoardEvent, Position } from '../../model/oo/board';
import { GameService } from '../../services/game.service';
import GameDTO from '../../model/gameDTO';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit, OnDestroy {
  game: GameDTO | null;
  board: Board<string> | null;
  selectedPosition: Position | null;
  turns: number;

  constructor(private gameService: GameService) {
    this.game = null;
    this.board = null;
    this.selectedPosition = null;
    this.turns = 0;
  }

  ngOnInit() {
    this.initializeGame();
  }

  ngOnDestroy() {
    this.board!.listeners = [];
    this.updateGame();
  }

  async initializeGame() {
    try {
      this.game = await this.gameService.startNewGame();
      this.board = this.createBoard();

      const handleBoardEvent = (event: BoardEvent<string>) => {
        if (event.kind === 'Match') {
          this.game!.score += 1;
          console.log(`Match event: matched ${event.match.matched} at positions ${JSON.stringify(event.match.positions)}`);
        } else if (event.kind === 'Refill') {
          console.log('Refill event');
          if (this.turns >= 5) {
            this.game!.completed = true;
          }
        }
      };

      this.board!.addListener(handleBoardEvent);
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  }

  createBoard(): Board<string> {
    const createGenerator = () => {
      const pieces = ['A', 'B', 'C', 'D'];
      return {
        next: () => pieces[Math.floor(Math.random() * pieces.length)],
      };
    };

    const generator = createGenerator();
    return new Board(generator, 5, 5);
  }

  handleBoardClick(position: Position) {
    if (this.game?.completed === true) {
      return;
    }

    if (!this.selectedPosition) {
      this.selectedPosition = position;
    } else {
      this.board?.move(this.selectedPosition, position);
      this.selectedPosition = null;
      this.turns += 1;
    }
  }


  updateGame() {
    try {
      if (this.game) {
        this.gameService.updateGame(this.game);
      }
    } catch (error) {
      console.error('Failed to update game', error);
    }
  }

  rows(): number[] {
    return Array.from({ length: this.board?.height || 0 }).map((_, index) => index);
  }
  
  cols(): number[] {
    return Array.from({ length: this.board?.width || 0 }).map((_, index) => index);
  }
  
}