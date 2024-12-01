const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let board = Array(9).fill(null);
let currentPlayer = "X";

io.on("connection", (socket) => {
  const symbol = io.sockets.sockets.size % 2 === 0 ? "X" : "O";

  socket.emit("init", { symbol, currentPlayer });

  socket.on("makeMove", ({ index }) => {
    if (board[index] === null) {
      board[index] = currentPlayer;
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      const winner = checkWinner();
      io.emit("updateBoard", {
        board,
        message: winner ? `${winner} wins!` : `${currentPlayer}'s turn.`,
      });
      if (winner) io.emit("gameOver", `${winner} wins!`);
    }
  });
});

function checkWinner() {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
