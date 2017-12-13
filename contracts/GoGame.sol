pragma solidity 0.4.18;

contract GoGame {
  address public owner;
  address public opponent;

  struct Game {
      uint[361] board;
      uint state; // 0: ongoing, 1: owner won, 2: opponent won
      uint turn;  // 0: owner has to move, 1: opponent has to move
      bool ownerPassed; // 0 if not passed, 1 if it has passed last turn
      bool opponentPassed; // 0 if not passed, 1 if it has passed last turn
      /*uint[] chain;*/
  }

  Game game;

  function GoGame(address gameOwner) public {
    owner = gameOwner;
    game.board[ 10 + 19 * 2] = 2;
    game.board[ 9 + 19 * 2] = 1;
    game.board[ 9 + 19 * 3] = 2;
    game.board[ 8 + 19 * 3] = 2;
    game.board[ 8 + 19 * 2] = 1;
    game.board[ 8 + 19 * 4] = 1;
    game.board[ 7 + 19 * 2] = 1;
    game.board[ 7 + 19 * 4] = 1;
    game.board[ 7 + 19 * 3] = 2;
    game.board[ 6 + 19 * 3] = 1;
    game.board[ 9 + 19 * 4] = 1;
    game.board[ 10 + 19 * 1] = 1;
    game.board[ 11 + 19 * 2] = 1;
    game.board[ 11 + 19 * 3] = 1;
    game.board[ 11 + 19 * 4] = 1;
    game.board[ 10 + 19 * 3] = 2;
    game.board[ 10 + 19 * 4] = 2;
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
      /*TODO check if a stone was captured */
      checkNeighbors(pos);

    } else if (game.turn == 1 && opponent == msg.sender) {
      /* TODO check validity of move */
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
      game.opponentPassed = false;
      /*TODO check if a stone was captured */
      checkNeighbors(pos);

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

/* The first step to checking if a capture occured.
    In this function, we check our neighbors to see if there is a stone of the
    opposing side nearby. If such a stone is found, we look to see if it is in
    a chain (capturing multiple stones). we then check if the stone(s) are
    surrounded by stones of our colour. If yes, then those stones are captured;
    if any of the stones in the chain have a free spot near it, they are not captured.
*/
  function checkNeighbors(uint myPosition) public {
    /* FIXME wrong stone type */
    uint color;
    if(game.board[myPosition] == 1) {
      color = 2;
    } else {
      color = 1;
    }

    check(myPosition - 19, color);
    check(myPosition + 19, color);
    check(myPosition - 1, color);
    check(myPosition + 1, color);
  }

  function check (uint position, uint color) private {
    if(game.board[position] == color) {
      uint[361] memory visited;
      uint[361] memory seen;
      uint visitedHead;
      uint seenHead;
      uint i;
      uint j;
      bool liberty;
      bool alreadyVisited;
      i = 0;
      liberty = false;
      seen[seenHead++] = position;
      while(i < seenHead) {
        position = seen[i++];

        // CHECK TOP
        if(game.board[position - 19] == color) {
          alreadyVisited = false;
          for(j=0; j < visitedHead; j++) {
            if(visited[j] == position - 19) {
              alreadyVisited = true;
              break;
            }
          }
          if(!alreadyVisited) {
            seen[seenHead++] = position - 19;
          }
        } else if (liberty == false && game.board[position - 19] == 0) {
          liberty = true;
        }

        // CHECK BOTTOM
        if(game.board[position + 19] == color) {
          alreadyVisited = false;
          for(j=0; j < visitedHead; j++) {
            if(visited[j] == position + 19) {
              alreadyVisited = true;
              break;
            }
          }
          if(!alreadyVisited) {
            seen[seenHead++] = position + 19;
          }
        } else if (liberty == false && game.board[position + 19] == 0) {
          liberty = true;
        }

        // CHECK LEFT
        if(game.board[position - 1] == color) {
          alreadyVisited = false;
          for(j=0; j < visitedHead; j++) {
            if(visited[j] == position - 1) {
              alreadyVisited = true;
              break;
            }
          }
          if(!alreadyVisited) {
            seen[seenHead++] = position - 1;
          }
        } else if (liberty == false && game.board[position - 1] == 0) {
          liberty = true;
        }

        // CHECK RIGHT
        if(game.board[position + 1] == color) {
          alreadyVisited = false;
          for(j=0; j < visitedHead; j++) {
            if(visited[j] == position + 1) {
              alreadyVisited = true;
              break;
            }
          }
          if(!alreadyVisited) {
            seen[seenHead++] = position + 1;
          }
        } else if (liberty == false && game.board[position + 1] == 0) {
          liberty = true;
        }


        visited[visitedHead++] = position;
      }

      if(liberty == false) {
        for(i = 0; i < visitedHead; i++) {
          game.board[visited[i]] = 0;
        }
      }
    }
  }

  function getBoard() public view returns (uint[361]) {
    return game.board;
  }

  /*function getChain() public view returns (uint[]){
    return chain;
  }*/

  function getData() public view returns (address, address, uint, uint) {
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
