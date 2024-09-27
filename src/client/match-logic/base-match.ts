import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Point, TurnHistory } from "../../shared/game";
import GamePiece from "../../shared/game-piece";
import { Lobby, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";
import { findByPoint } from "../scenes/scene-helpers";

export interface MatchLogic {
  requestResolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }): TurnHistory | undefined;
  isPlayersTurn(): boolean;
  getPlayerTeam(): TEAM | undefined;
  isCurrentPlayersPiece(piece: GamePiece): boolean;
  resetRequest(): boolean;
  undoTurnRequest(): boolean;
}

export class BaseMatch {
  private game: Game;
  lobby: Lobby;
  player: Player;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    this.game = new Game();
    this.lobby = lobby;
    this.player = player;
  }

  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.getGame().move(originPoint, targetPoint);
  }

  reset() {
    this.game.resetGame();
  }

  saveGame() {
    //Save game state to database
  }

  loadGame() {
    //Load game state from database
  }

  getGame() {
    return this.game;
  }

  isGameOver() {
    return this.game.isCheckmate();
  }

  getWinner() {
    return this.game.getWinner();
  }

  getGameHistory() {
    return this.game.getHistory();
  }

  getAllGamePieces() {
    return this.game.getAllPieces();
  }

  undoTurn() {
    return this.game.undoTurn();
  }

  nextTurn() {
    return this.game.nextTurn();
  }

  isValidMove({
    pickedPiece,
    selectedPiece,
  }: {
    pickedPiece: GamePiece;
    selectedPiece: GamePiece;
  }) {
    return this.game.isMove(selectedPiece, pickedPiece.point);
  }

  getValidMoves(piece: GamePiece) {
    return this.game.getMoves({ piece, returnOnlyValid: true });
  }

  lookupGamePiece(pickedMesh: AbstractMesh, externalMesh: boolean) {
    return this.game.lookupPiece(
      findByPoint({
        get: "index",
        point: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh,
      })
    );
  }
}
