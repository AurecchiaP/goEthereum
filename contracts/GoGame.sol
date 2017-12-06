pragma solidity 0.4.18;

contract GoGame {
  address public owner;
  address public opponent;
  uint n;

  struct Game {
      uint[361] board;
      byte state;
      uint turn;
  }

  Game game;

  function GoGame(uint c) public {
    n = c;
    owner = msg.sender;
  }

  function move(uint pos) public {
    if (game.turn == 0 && owner == msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
    } else if (game.turn == 1 && owner != msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
    }
  }

  function getBoard() public view returns (uint[361]) {
    return game.board;
  }

  function getNumber() public view returns (uint) {
    return n;
  }

  function setVariable(uint pos) public {
    if(pos < 361) {
      game.board[pos] = 1;

    }
  }

  function getMove(uint pos) public pure returns(uint) {
    if(pos < 361) {
      return pos;
    }
    return 404; // illegal position
  }
}
