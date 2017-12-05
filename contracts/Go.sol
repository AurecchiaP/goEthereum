pragma solidity 0.4.18;

contract Go {
  address public owner;
  address public player2;

  struct Game {
      uint[361] board;
      byte state;
      uint turn;
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

      game.board[pos] = game.turn + 1;
      // board has to be updated. where/how we do this?

  }

  function getBoard()public view returns (uint[361]) {
    return game.board;
  }

  function setVariable(uint pos)public{
    if(pos < 361){
      game.board[pos] = 1;

    }
  }
  function getMove(uint pos) public pure returns(uint){
    if(pos < 361){
      return pos;
    }
    return 404; // illegal position
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
