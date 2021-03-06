import * as React from "react";
import "./App.css";
import * as Rx from "rxjs/Rx";

type SquareValueType = "X" | "O" | undefined;
type BoardType = SquareValueType[];
type HistoryType = BoardType[];
type SquareIndexType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Moves are indexed and displayed; this is the type of the move index.
type MoveIndexType = number;

interface SquareProps {
    value: SquareValueType;
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
    board: BoardType;
    onClick: (squareNum: SquareIndexType) => void;
}

function Board(props: BoardProps) {
    function renderSquare(i: SquareIndexType) {
        return <Square value={props.board[i]} onClick={() => props.onClick(i)} />;
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

interface MoveHistoryItemProps {
    move: MoveIndexType;
    onClick: () => void;
}

function MoveHistoryItem(props: MoveHistoryItemProps) {
    const move = props.move;
    const desc = move ? "Move #" + move : "Game start";

    return (
        <li>
            <a href="#" onClick={props.onClick}>
                {desc}
            </a>
        </li>
    );
}

interface GameState {
    history: HistoryType;
}

interface GamewViewModelInputs {
    clickSquare$: Rx.Subject<SquareIndexType>;
    clickMove$: Rx.Subject<MoveIndexType>;
}

interface GameViewModelOutputs {
    history$: Rx.Observable<HistoryType>;
}

function last<T>(arr: Array<T>): T | undefined {
    return arr[arr.length - 1];
}

function nextMovePlayer(history: HistoryType) {
    return history.length % 2 === 0 ? "O" : "X";
}

function GameViewModel(input: GamewViewModelInputs): GameViewModelOutputs {
    let clickSquareReducer = input.clickSquare$.map(
        squareNum => (history: HistoryType): HistoryType => {
            const board = last(history)!;
            if (board[squareNum] || calculateWinner(board)) {
                return history;
            }
            const newBoard = board.slice();
            newBoard[squareNum] = nextMovePlayer(history);
            return [...history, newBoard];
        }
    );

    let clickMoveReducer = input.clickMove$.map(move => (history: HistoryType) => {
        return history.slice(0, move + 1);
    });

    let emptyBoard = new Array(9).fill(undefined);

    let history$ = Rx.Observable
        .merge(clickSquareReducer, clickMoveReducer)
        .scan((history, reducer) => reducer(history), [emptyBoard]);

    return {
        history$: history$
    };
}

class Game extends React.Component<{}, GameState> {
    inputs: GamewViewModelInputs = {
        clickSquare$: new Rx.Subject(),
        clickMove$: new Rx.Subject()
    };

    subscription: Rx.Subscription;

    constructor() {
        super();
        this.state = { history: [new Array(9).fill(undefined)] };
    }

    componentDidMount() {
        let outputs = GameViewModel(this.inputs);
        this.subscription = outputs.history$.subscribe(history =>
            this.setState({ history: history })
        );
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    render() {
        const history = this.state.history;
        const board = history[history.length - 1];

        const moves = history.map((steps, move) => {
            return (
                <MoveHistoryItem
                    key={move}
                    move={move}
                    onClick={() => this.inputs.clickMove$.next(move)}
                />
            );
        });

        const winner = calculateWinner(board);
        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + nextMovePlayer(this.state.history);
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        board={this.state.history[this.state.history.length - 1]}
                        onClick={n => this.inputs.clickSquare$.next(n)}
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

function calculateWinner(board: SquareValueType[]) {
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
    return undefined;
}

export default Game;
