import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  gameStarted = false;

  gameState: any = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameOver: false,
    winner: null,
    gameMode: null,
  };

  constructor(private http: HttpClient) {}

  // Start new game
  startGame(mode: string) {
    this.gameStarted = true;
    this.gameState = {
      board: Array(9).fill(''),
      currentPlayer: 'X',
      gameOver: false,
      winner: null,
      gameMode: mode,
    };
  }

  // Player move
  makeMove(index: number) {
    if (this.gameState.board[index] || this.gameState.gameOver) return;

    this.gameState.board[index] = this.gameState.currentPlayer;
    this.checkWinner();

    if (!this.gameState.gameOver) {
      this.gameState.currentPlayer =
        this.gameState.currentPlayer === 'X' ? 'O' : 'X';

      // If PVC and it's computer's turn
      if (
        this.gameState.gameMode === 'pvc' &&
        this.gameState.currentPlayer === 'O'
      ) {
        setTimeout(() => this.computerMove(), 500);
      }
    }
  }

  // Computer move from backend
  computerMove() {
    this.http
      .post<any>('http://127.0.0.1:5000/api/computer-move', {
        board: this.gameState.board,
      })
      .subscribe((res) => {
        if (res.index !== -1) {
          this.gameState.board[res.index] = 'O';
          this.checkWinner();
          if (!this.gameState.gameOver) {
            this.gameState.currentPlayer = 'X';
          }
        }
      });
  }

  // Check winner/draw
  checkWinner() {
    const b = this.gameState.board;
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combo of wins) {
      const [a, b1, c] = combo;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        this.gameState.gameOver = true;
        this.gameState.winner = b[a];
        return;
      }
    }

    if (!b.includes('')) {
      this.gameState.gameOver = true;
      this.gameState.winner = 'draw';
    }
  }

  // Restart game (keep same mode)
  resetGame() {
    const mode = this.gameState.gameMode;
    this.startGame(mode);
  }

  // Back to main menu
  backToMenu() {
    this.gameStarted = false;
    this.gameState = {
      board: Array(9).fill(''),
      currentPlayer: 'X',
      gameOver: false,
      winner: null,
      gameMode: null,
    };
  }
}
