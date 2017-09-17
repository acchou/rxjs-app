import * as React from "react";
import * as ReactDOM from "react-dom";
import Game from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";
import * as Rx from "rxjs/Rx";

ReactDOM.render(
    <Game clickSquare={new Rx.Subject()} clickMove={new Rx.Subject()} />,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
