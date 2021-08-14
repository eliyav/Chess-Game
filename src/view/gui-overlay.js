import * as GUI from "babylonjs-gui";

function createGUI(startScene, gameScene, showScene, gameMode, emitter, socket) {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("StartUI", true, startScene);
  const advancedTexture2 = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GameUI", true, gameScene);

  //Start Screen
  const button = GUI.Button.CreateSimpleButton("button", "Start Offline Game");
  button.width = 0.1;
  button.height = "35px";
  button.color = "white";
  button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button.paddingTop = "5px";
  button.paddingLeft = "5px";
  advancedTexture.addControl(button);
  button.onPointerUpObservable.add(function () {
    gameMode.mode = "offline";
    startScene.detachControl();
    showScene.sceneIndex === 0 ? (showScene.sceneIndex = 1) : (showScene.sceneIndex = 0);
  });

  const button1 = GUI.Button.CreateSimpleButton("button1", "Start Online Game");
  button1.width = 0.1;
  button1.height = "35px";
  button1.color = "white";
  button1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button1.paddingTop = "5px";
  button1.left = 200;
  advancedTexture.addControl(button1);
  button1.onPointerUpObservable.add(function () {
    gameMode.mode = "online";
    socket.emit("request-room-id");
    startScene.detachControl();
    showScene.sceneIndex === 0 ? (showScene.sceneIndex = 1) : (showScene.sceneIndex = 0);
  });

  const button2 = GUI.Button.CreateSimpleButton("button2", "Join Online Game");
  button2.width = 0.1;
  button2.height = "35px";
  button2.color = "white";
  button2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button2.paddingTop = "5px";
  button2.left = 400;
  advancedTexture.addControl(button2);
  button2.onPointerUpObservable.add(function () {
    gameMode.mode = "online";
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
    startScene.detachControl();
    showScene.sceneIndex === 0 ? (showScene.sceneIndex = 1) : (showScene.sceneIndex = 0);
  });

  //Game Screen
  const button01 = GUI.Button.CreateSimpleButton("button01", "Home Screen");
  button01.width = 0.1;
  button01.height = "35px";
  button01.color = "white";
  button01.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button01.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button01.paddingTop = "5px";
  button01.paddingLeft = "5px";
  advancedTexture2.addControl(button01);
  button01.onPointerUpObservable.add(function () {
    gameScene.detachControl();
    showScene.sceneIndex === 0 ? (showScene.sceneIndex = 1) : (showScene.sceneIndex = 0);
  });

  const button02 = GUI.Button.CreateSimpleButton("button02", "Reset Board");
  button02.width = 0.1;
  button02.height = "35px";
  button02.color = "white";
  button02.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button02.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button02.paddingTop = "5px";
  button02.left = 200;
  advancedTexture2.addControl(button02);
  button02.onPointerUpObservable.add(function () {
    emitter.emit("reset-board");
  });
}

export default createGUI;