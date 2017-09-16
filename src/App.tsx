import * as React from "react";
import "./App.css";
import * as Rx from "rxjs/Rx";

type SquareValue = "X" | "O" | undefined;

interface SquareProps {
    value: SquareValue;
    squareNum: number;
}

function Square(props: SquareProps) {
    return (
        <button className="square" data-square-num={props.squareNum}>
            {props.value}
        </button>
    );
}

interface BoardProps {
    board: SquareValue[];
}

function Board(props: BoardProps) {
    function renderSquare(i: number) {
        return <Square value={props.board[i]} squareNum={i} />;
    }

    return (
        <div>
            <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    );
}

interface GameState {
    history: SquareValue[][];
    turn: "X" | "O";
}

interface ListItemMoveHistoryProps {
    move: number;
}

function ListItemMoveHistory(props: ListItemMoveHistoryProps) {
    const move = props.move;
    const desc = move ? "Move #" + move : "Game start";

    return (
        <li key={move}>
            <a href="#" className="move" data-move={move}>
                {desc}
            </a>
        </li>
    );
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = { history: [new Array(9).fill(null)], turn: "X" };
    }

    handleClick(i: number) {
        const history = this.state.history;
        const board = history[history.length - 1].slice();

        if (calculateWinner(board) || board[i]) {
            return;
        }

        this.setState((prevState, props) => {
            board[i] = prevState.turn;
            const turn = prevState.turn === "X" ? "O" : "X";
            return { history: history.concat([board]), turn: turn };
        });
    }

    jumpTo = (move: number) => {
        this.setState((prevState, props) => {
            const history = prevState.history;
            return {
                history: history.slice(0, move + 1),
                turn: move % 2 === 0 ? "X" : "O"
            };
        });
    };

    render() {
        const history = this.state.history;
        const board = history[history.length - 1];

        const moves = history.map((steps, move) => {
            return <ListItemMoveHistory key={move} move={move} />;
        });

        const winner = calculateWinner(board);
        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + this.state.turn;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board board={this.state.history[this.state.history.length - 1]} />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function target(ev: Event): HTMLElement {
    return ev.target as HTMLElement;
}

function dataset(ev: Event): DOMStringMap {
    return target(ev).dataset;
}

function addListeners() {
    let moves = document.querySelectorAll(".move");
    let squares = document.querySelectorAll(".squares");

    const squareClicks$ = Rx.Observable
        .fromEvent(squares, "click")
        .map(dataset)
        .map(data => data.squareNum);

    const moveClicks$ = Rx.Observable
        .fromEvent(moves, "click")
        .map(dataset)
        .map(data => data.move);
}

function calculateWinner(board: SquareValue[]) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

export default Game;
