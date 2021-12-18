import React, { useEffect, useRef, useState } from "react";
import "babylonjs-loaders";
import "./index.css";
import * as BABYLON from "babylonjs";
import MainContent from "./main-content";
import LoadingScreen from "./component/loading-screen";
import initEmitter from "./events/emitter";
import activateSocket from "./events/sockets";
import initGameController from "./events/game-interaction";
import EventEmitter from "./events/event-emitter";
import initView, { CanvasView } from "./view/view-init";
import Match from "./component/match";

const App: React.VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const match = useRef<Match>();
  const canvasView = useRef<CanvasView>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    canvasView.current = await initView(canvasRef.current!, engine);
    //Activate Socket
    // socket.current = activateSocket(match.current, canvasView.current);
    //Activate Emitter
    emitter.current = initEmitter(
      match,
      canvasView.current
      // socket.current
    );

    setAppLoaded(true);
  }

  useEffect(() => {
    initApp(canvasRef.current!);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} touch-action="none"></canvas>
      {appLoaded ? (
        <MainContent
          matchRef={match}
          viewRef={canvasView}
          emitter={emitter.current}
          socket={socket.current}
        />
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default App;
