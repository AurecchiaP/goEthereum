pragma solidity 0.4.18;

contract Go {
  address public owner;
  address public player2;

  struct Game {
      byte[361] board;
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

  function getBoard()public returns (byte[361]) {
    return game.board;
  }

  function setVariable(uint pos)public{
    if(pos < 362){
      game.board[pos] = 1;

  }


}
