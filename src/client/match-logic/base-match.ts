import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Move, Point } from "../../shared/game";
import { Lobby, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";
import { TurnHistory } from "../game-logic/game-helpers";
import GamePiece from "../game-logic/game-piece";
import { findByPoint } from "../scenes/scene-helpers";

export interface MatchLogic {
  requestResolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }): false | TurnHistory;
  isPlayersTurn(): boolean;
  getPlayerTeam(): TEAM | undefined;
  nextTurn(): void;
  isCurrentPlayersPiece(piece: GamePiece): boolean;
  isValidMove({
    pickedPiece,
    selectedPiece,
  }: {
    pickedPiece: GamePiece;
    selectedPiece: GamePiece;
  }): Move | undefined;
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
    return this.getGame().resolveMove(originPoint, targetPoint);
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
    return this.game.allPieces();
  }

  undoTurn() {
    return this.game.undoTurn();
  }

  getValidMoves(gamePiece: GamePiece) {
    return this.game.getValidMoves(gamePiece);
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

  setPromotion(selection: string) {
    this.game.setPromotionPiece(selection);
  }
}
