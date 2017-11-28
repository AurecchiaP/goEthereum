pragma solidity 0.4.18;

contract Go {
  address public owner;
  address public player2;

  struct Game {
      byte[] board;
      byte state;
      byte turn;
  }

  Game game;

  modifier ownerRestricted() {
    if (msg.sender == owner) _;
  }

  modifier player2Restricted() {
    if (msg.sender == player2) _;
  }

  function Go() public {
    owner = msg.sender;
  }

  function move(uint pos) public {
      // assert move is right

      // do require with modifiers?
      require(
        (msg.sender == owner   && game.turn == 0) ||
        (msg.sender == player2 && game.turn == 1));

      game.board[pos] = game.turn;
      // board has to be updated. where/how we do this?

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
