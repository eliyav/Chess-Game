import { Point } from "../../shared/game.js";
import { TEAM } from "../../shared/match.js";
import chessData from "./chess-data-import.js";
import GamePiece from "./game-piece.js";

export type Grid = {
  name: string;
  on?: GamePiece;
}[][];

class Board {
  initialPositions: typeof chessData.initialPositions;
  boardSize: number;
  columnNames: string[];
  grid: Grid;

  constructor() {
    this.initialPositions = chessData.initialPositions;
    this.boardSize = chessData.boardSize;
    this.columnNames = chessData.columnNames;
    this.grid = this.createGrid();
    this.setPieces();
  }

  cloneBoard() {
    const newBoard = new Board();
    newBoard.grid = this.grid.map((row) =>
      row.map((square) => ({ ...square }))
    );
    return newBoard;
  }

  setPieces() {
    this.initialPositions.forEach((positions) => {
      const { type } = positions;
      positions.teams.forEach((team) => {
        team.startingPoints.forEach((point) => {
          this.addPiece({
            point: point,
            piece: new GamePiece({ type, team: team.name }),
          });
        });
      });
    });
  }

  createGrid(): Grid {
    return Array.from({ length: this.boardSize }, (_, idx) =>
      Array.from({ length: this.boardSize }, (_, idx2) => ({
        name: this.columnNames[idx] + (idx2 + 1),
      }))
    );
  }

  getSquare([x, y]: Point) {
    return this.grid[x][y];
  }

  getPiece(point: Point) {
    return this.getSquare(point).on;
  }

  getPieces() {
    return this.grid
      .flatMap((row, x) =>
        row.map((square, y) => ({
          piece: square.on,
          point: [x, y] as Point,
        }))
      )
      .filter(({ piece }) => piece !== undefined);
  }

  removePiece({ point }: { point: Point }) {
    const square = this.getSquare(point);
    square.on = undefined;
  }

  addPiece({ point, piece }: { point: Point; piece: GamePiece }) {
    const square = this.getSquare(point);
    square.on = piece;
  }

  getDirection(team: TEAM) {
    return team === TEAM.WHITE ? 1 : -1;
  }

  resetBoard() {
    this.grid = this.createGrid();
    this.setPieces();
  }
}

export default Board;
