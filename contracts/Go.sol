pragma solidity 0.4.18;

contract Go {
  address public owner;
  address public player2;

  struct Game {
      uint[361] board;
      byte state;
      /*TODO use bool*/
      uint turn;
  }


  Game game;

  address[] games;

  modifier ownerRestricted() {
    if (msg.sender == owner) _;
  }

  modifier player2Restricted() {
    if (msg.sender == player2) _;
  }

  function Go() public {
    owner = msg.sender;
  }

  function newGame() public {
    /* TODO create a new contract game and push its address */
    games.push(owner);
  }

  function getGames() public view returns (address[]) {
    return games;
  }


  function move(uint pos) public {
    if(game.turn == 0 && owner == msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
    } else if(game.turn == 1 && owner != msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
    }
  }

  function getBoard() public view returns (uint[361]) {
    return game.board;
  }

  function setVariable(uint pos) public {
    if(pos < 361) {
      game.board[pos] = 1;

    }
  }
  function getMove(uint pos) public pure returns(int) {
    if(pos < 361) {
      return pos;
    }
    return -1; // illegal position
  }
}

contract Gos {
  address public owner;
  Go[] public games;


  modifier ownerRestricted() {
    if (msg.sender == owner) _;
  }

  function Gos() public {
    owner = msg.sender;
  }

  function addGame(Go game) public {
      games.push(game);
  }
}
