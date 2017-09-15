import * as React from "react";
import "./App.css";
import * as Rx from "rxjs/Rx";

type SquareState = "X" | "O" | undefined;

interface SquareProps {
    value: SquareState;
    onClick: () => void;
}

function Square(props: SquareProps) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

interface BoardProps {
    board: SquareState[];
    onClick: (i: number) => void;
}

class Board extends React.Component<BoardProps> {
    renderSquare(i: number) {
        return <Square value={this.props.board[i]} onClick={() => this.props.onClick(i)} />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

interface GameState {
    history: SquareState[][];
    turn: "X" | "O";
}

interface ListItemMoveHistoryProps {
    move: number;
    onClick: (move: number) => void;
}

function ListItemMoveHistory(props: ListItemMoveHistoryProps) {
    const move = props.move;
    const desc = move ? "Move #" + move : "Game start";
    const handleClick = () => props.onClick(move);
    return (
        <li key={move}>
            <a href="#" onClick={handleClick}>
                {desc}
            </a>
        </li>
    );
}

class Game extends React.Component<{}, GameState> {
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
            return <ListItemMoveHistory key={move} move={move} onClick={this.jumpTo} />;
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
                    <Board
                        board={this.state.history[this.state.history.length - 1]}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(board: SquareState[]) {
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
