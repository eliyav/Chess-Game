import { getSquaresandPieces, canValidMoveResolve, switchSquaresBack } from "./game-helpers";

const renderScene = (game, gameScene) => {
  //Clears old meshes/memory usage
  !gameScene.meshesToRender ? (gameScene.meshesToRender = []) : null;
  if (gameScene.meshesToRender.length > 0) {
    for (let i = 0; i < gameScene.meshesToRender.length; i++) {
      const mesh = gameScene.meshesToRender[i];
      gameScene.removeMesh(mesh);
      mesh.dispose();
    }
    gameScene.meshesToRender = [];
  }
  //Final Piece Mesh List
  const meshesList = gameScene.finalMeshes.piecesMeshes;
  //Filters Grid state for all active squares
  const filteredSquares = game.board.grid.flat().filter((square) => square.on !== undefined);
  //For each active piece, creates a mesh clone and places on board
  filteredSquares.forEach((square) => {
    const { name, color, point } = square.on;
    const clone = meshesList.find((mesh) => mesh.name === name && mesh.color === color).clone(name);
    [clone.position.z, clone.position.x, clone.isVisible = true] = calcMeshCanvasPosition(point);
    gameScene.meshesToRender.push(clone);
  });
};

const displayPieceMoves = (mesh, currentMove, game, gameScene) => {
  const grid = game.board.grid;
  const state = game.state;
  const turnHistory = game.turnHistory[game.turnHistory.length - 1];
  const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
  const piece = grid[x][y].on;
  displayMovementSquares([x, y], gameScene, "piece");
  let moves = piece.calculateAvailableMoves(grid, state, turnHistory, true);
  currentMove.push(piece.point);
  //Add filter to display only moves that can resolve
  const isValidMoveToDisplay = moves
    .map((move) => {
      //Check for checkmate if move resolves
      const [pieceX, pieceY] = piece.point;
      const squaresandPieces = getSquaresandPieces(piece.point, move[0], grid);
      const validMove = canValidMoveResolve(squaresandPieces, move[0], state, grid, turnHistory);
      switchSquaresBack(squaresandPieces, [pieceX, pieceY]);
      return validMove ? move : null;
    })
    .filter((move) => move !== null)
    .forEach((point) => {
      displayMovementSquares(point, gameScene, "target");
    });
};

const displayMovementSquares = (point, gameScene, desc) => {
  if (desc === "target") {
    const plane = BABYLON.MeshBuilder.CreatePlane(`plane`, { width: 2.8, height: 2.8 });
    [plane.position.z, plane.position.x] = calcBabylonCanvasPosition(point[0]); //Z is X ---- X is Y
    plane.point = point[0];
    plane.position.y += 0.51;
    plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
    if (point[1] === "capture") {
      plane.material = gameScene.materials.find((material) => material.id === "redMat");
    } else if (point[1] === "movement") {
      plane.material = gameScene.materials.find((material) => material.id === "orangeMat");
    } else if (point[1] === "enPassant") {
      plane.material = gameScene.materials.find((material) => material.id === "purpleMat");
    } else if (point[1] === "castling") {
      plane.material = gameScene.materials.find((material) => material.id === "blueMat");
    }
    gameScene.meshesToRender.push(plane);
  } else if (desc === "piece") {
    const torus = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 2.6, thickness: 0.2, tessellation: 16 });
    [torus.position.z, torus.position.x] = calcBabylonCanvasPosition(point); //Z is X ---- X is Y
    torus.point = point;
    torus.position.y += 0.51;
    torus.material = gameScene.materials.find((material) => material.id === "greenMat");
    gameScene.meshesToRender.push(torus);
  }
};

const rotateCamera = (currentPlayer, gameScene) => {
  let a = gameScene.cameras[0].alpha;
  let divisible;
  let subtractedDivisible;
  let piDistance;
  let remainingDistance;
  let remainder;
  if (currentPlayer === "Black") {
    if (a < 0) {
      divisible = Math.ceil(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedDivisible);
      remainder = divisible % 2;
      remainder ? (remainingDistance = piDistance) : (remainingDistance = Math.PI - piDistance);
    } else {
      divisible = Math.floor(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.PI - subtractedDivisible;
      remainder = divisible % 2;
      remainder ? (remainingDistance = piDistance) : (remainingDistance = Math.PI - piDistance);
    }
  } else {
    if (a < 0) {
      divisible = Math.ceil(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedDivisible);
      remainder = divisible % 2;
      remainder ? (remainingDistance = Math.PI - piDistance) : (remainingDistance = piDistance);
    } else {
      divisible = Math.floor(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.PI - subtractedDivisible;
      remainder = divisible % 2;
      remainder ? (remainingDistance = Math.PI - piDistance) : (remainingDistance = piDistance);
    }
  }

  const animateTurnSwitch = () => {
    requestAnimationFrame(() => {
      if (currentPlayer === "Black") {
        if (remainingDistance > 0.05) {
          if (remainder) {
            if (remainder < 0) {
              gameScene.cameras[0].alpha -= 0.05;
            } else {
              gameScene.cameras[0].alpha += 0.05;
            }
          } else {
            if (a > 0) {
              gameScene.cameras[0].alpha -= 0.05;
            } else {
              gameScene.cameras[0].alpha += 0.05;
            }
          }
          remainingDistance -= 0.05;
          animateTurnSwitch(currentPlayer);
        } else if (remainingDistance > 0) {
          if (remainder) {
            if (remainder < 0) {
              gameScene.cameras[0].alpha -= 0.01;
            } else {
              gameScene.cameras[0].alpha += 0.01;
            }
          } else {
            if (a > 0) {
              gameScene.cameras[0].alpha -= 0.01;
            } else {
              gameScene.cameras[0].alpha += 0.01;
            }
          }
          remainingDistance -= 0.01;
          animateTurnSwitch(currentPlayer);
        }
      } else {
        //If other player
        if (remainingDistance > 0.05) {
          if (remainder) {
            if (remainder < 0) {
              gameScene.cameras[0].alpha += 0.05;
            } else {
              gameScene.cameras[0].alpha -= 0.05;
            }
          } else {
            if (a > 0) {
              gameScene.cameras[0].alpha += 0.05;
            } else {
              gameScene.cameras[0].alpha -= 0.05;
            }
          }
          remainingDistance -= 0.05;
          animateTurnSwitch(currentPlayer);
        } else if (remainingDistance > 0) {
          if (remainder) {
            if (remainder < 0) {
              gameScene.cameras[0].alpha += 0.01;
            } else {
              gameScene.cameras[0].alpha -= 0.01;
            }
          } else {
            if (a > 0) {
              gameScene.cameras[0].alpha += 0.01;
            } else {
              gameScene.cameras[0].alpha -= 0.01;
            }
          }
          remainingDistance -= 0.01;
          animateTurnSwitch(currentPlayer);
        }
      }
    });
  };
  animateTurnSwitch(currentPlayer);
};

//Calculate canvas position for loaded meshes
const calcMeshCanvasPosition = (point) => {
  const [x, y] = point;
  let gridX, gridY;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else if (x === 7) {
    gridX = -10.5;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y === 0) {
    gridY = 10.5;
  } else if (y === 1) {
    gridY = 7.5;
  } else if (y === 2) {
    gridY = 4.5;
  } else if (y === 3) {
    gridY = 1.5;
  } else if (y === 4) {
    gridY = -1.5;
  } else if (y === 5) {
    gridY = -4.5;
  } else if (y === 6) {
    gridY = -7.5;
  } else if (y === 7) {
    gridY = -10.5;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  return [gridX, gridY];
};

//For Babylon meshes, they have different x/y/z relation than loaded meshes
const calcBabylonCanvasPosition = (point) => {
  const [x, y] = point;
  let gridX, gridY;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else if (x === 7) {
    gridX = -10.5;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y === 0) {
    gridY = -10.5;
  } else if (y === 1) {
    gridY = -7.5;
  } else if (y === 2) {
    gridY = -4.5;
  } else if (y === 3) {
    gridY = -1.5;
  } else if (y === 4) {
    gridY = 1.5;
  } else if (y === 5) {
    gridY = 4.5;
  } else if (y === 6) {
    gridY = 7.5;
  } else if (y === 7) {
    gridY = 10.5;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  return [gridX, gridY];
};

//For game pieces calculation as their index is flipped from blender importing
const calcIndexFromMeshPosition = (point) => {
  const [x, y] = point;
  let indexX, indexY;
  //Calculate X
  if (x === 10.5) {
    indexX = 0;
  } else if (x === 7.5) {
    indexX = 1;
  } else if (x === 4.5) {
    indexX = 2;
  } else if (x === 1.5) {
    indexX = 3;
  } else if (x === -1.5) {
    indexX = 4;
  } else if (x === -4.5) {
    indexX = 5;
  } else if (x === -7.5) {
    indexX = 6;
  } else if (x === -10.5) {
    indexX = 7;
  } else {
    return console.log("Error");
  }
  //Calculate Y
  if (y === 10.5) {
    indexY = 0;
  } else if (y === 7.5) {
    indexY = 1;
  } else if (y === 4.5) {
    indexY = 2;
  } else if (y === 1.5) {
    indexY = 3;
  } else if (y === -1.5) {
    indexY = 4;
  } else if (y === -4.5) {
    indexY = 5;
  } else if (y === -7.5) {
    indexY = 6;
  } else if (y === -10.5) {
    indexY = 7;
  } else {
    return console.log("Error");
  }

  return [indexX, indexY];
};

const calculatePoint = (x, y) => {
  //Calculate X
  if (x > 9 && x < 12) {
    x = 0;
  } else if (x > 6 && x < 9) {
    x = 1;
  } else if (x > 3 && x < 6) {
    x = 2;
  } else if (x > 0 && x < 3) {
    x = 3;
  } else if (x < 0 && x > -3) {
    x = 4;
  } else if (x < -3 && x > -6) {
    x = 5;
  } else if (x < -6 && x > -9) {
    x = 6;
  } else if (x < -9 && x > -12) {
    x = 7;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y < -9 && y > -12) {
    y = 0;
  } else if (y < -6 && y > -9) {
    y = 1;
  } else if (y < -3 && y > -6) {
    y = 2;
  } else if (y < 0 && y > -3) {
    y = 3;
  } else if (y > 0 && y < 3) {
    y = 4;
  } else if (y > 3 && y < 6) {
    y = 5;
  } else if (y > 6 && y < 9) {
    y = 6;
  } else if (y > 9 && y < 12) {
    y = 7;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  const canvasX = x;
  const canvasY = y;
  return [canvasX, canvasY];
};

export { renderScene, rotateCamera, displayPieceMoves, calcIndexFromMeshPosition };
