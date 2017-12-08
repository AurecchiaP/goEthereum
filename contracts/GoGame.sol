pragma solidity 0.4.18;

contract GoGame {
  address public owner;
  address public opponent;

  struct Game {
      uint[361] board;
      byte state; // 0: ongoing, 1: owner won, 2: opponent won
      uint turn;  // 0: owner has to move, 1: opponent has to move
      bool ownerPassed; // 0 if not passed, 1 if it has passed last turn
      bool opponentPassed; // 0 if not passed, 1 if it has passed last turn
  }

  Game game;

  function GoGame(address gameOwner) public {
    owner = gameOwner;
  }

  function move(uint pos) public {
    if(msg.sender != owner && opponent == 0) {
      opponent = msg.sender;
    }
    if (game.turn == 0 && owner == msg.sender) {
      /* TODO check validity of move */
      /* +1 because its the next turn */
      game.turn = game.turn + 1;
      /* +1 because 0 is empty, 1 is p1, 2 is p2 */
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
      game.ownerPassed = false;


    } else if (game.turn == 1 && opponent == msg.sender) {
      /* TODO check validity of move */
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
      game.opponentPassed = false;
    }
  }

  function pass() public {
    if(msg.sender != owner && opponent == 0) {
      opponent = msg.sender;
    }
    if (game.turn == 0 && owner == msg.sender) {
      game.ownerPassed = true;
      game.turn = (game.turn + 1) % 2;


    } else if (game.turn == 1 && opponent == msg.sender) {
      game.opponentPassed = true;
      game.turn = (game.turn + 1) % 2;
    }

    if(game.ownerPassed && game.opponentPassed) {
      /* TODO check who won and set 1 or 2 */
      game.state = 1;
    }
  }

  function getBoard() public view returns (uint[361]) {
    return game.board;
  }

  function getData() public view returns (address, address, uint, byte) {
    return (owner, opponent, game.turn, game.state);
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
