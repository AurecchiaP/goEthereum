pragma solidity 0.4.18;

contract GoGame {
  address public owner;
  address public opponent;

  struct Game {
      uint8[361] board;
      uint8 state; // 0: ongoing, 1: owner won, 2: opponent won
      uint8 turn;  // 0: owner has to move, 1: opponent has to move
      bool ownerPassed; // 0 if not passed, 1 if it has passed last turn
      bool opponentPassed; // 0 if not passed, 1 if it has passed last turn
  }

  Game game;

  function GoGame(address gameOwner) public {
    owner = gameOwner;
  }

  /* handles the passing of a turn of a player */
  function pass() public {
    /* bool player2won = false; */
    if (msg.sender != owner && opponent == 0) {
      opponent = msg.sender;
    }
    if (game.turn == 0 && owner == msg.sender) {
      game.ownerPassed = true;
      game.turn = (game.turn + 1) % 2;


    } else if (game.turn == 1 && opponent == msg.sender) {
      game.opponentPassed = true;
      game.turn = (game.turn + 1) % 2;
    }

    if (game.ownerPassed && game.opponentPassed) {
      checkSimpleWinner();
    }
  }

  /* handles the move of a player */
  function move(uint16 pos) public {
    bool liberty = false;
    if (game.state != 0) {
      return;
    }
    if (game.board[pos] != 0){
      return;
    }
    if(pos > 18 && game.board[pos - 19] == 0 ) {
      liberty = true;
    } else if (pos < 342 && game.board[pos + 19] == 0) {
      liberty = true;
    } else if (pos % 19 != 0 && game.board[pos - 1] == 0) {
      liberty = true;
    } else if (pos % 19 != 18 && game.board[pos + 1] == 0) {
      liberty = true;
    }

    if (!liberty) {
      return;
    }

    if (msg.sender != owner && opponent == 0) {
      opponent = msg.sender;
    }

    if (game.turn == 0 && owner == msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
      game.ownerPassed = false;
      checkNeighbors(pos);
    } else if (game.turn == 1 && opponent == msg.sender) {
      game.turn = game.turn + 1;
      game.board[pos] = game.turn;
      game.turn = game.turn % 2;
      game.opponentPassed = false;
      checkNeighbors(pos);
    }

  }

  /* checks if the 4 neighbors (N,S,W,E) are of our same color(i.e. part of the
     same chain) */
  function checkNeighbors(uint16 myPosition) public {
    uint8 color;
    if (game.board[myPosition] == 1) {
      color = 2;
    } else {
      color = 1;
    }
    /* if we arent on the top row */
    if (myPosition > 18){
      check(myPosition - 19, color); // up
    }
    if (myPosition < 342){
      check(myPosition + 19, color); // down
    }
    if (myPosition % 19 != 0){
      check(myPosition - 1, color); // left
    }
    if (myPosition % 19 != 18){
      check(myPosition + 1, color); // right
    }
  }

  /* returns the current board of the game */
  function check(uint16 position, uint8 color) private {
    if (game.board[position] == color) {
      uint16[361] memory visited;
      uint16[361] memory seen;
      uint16 visitedHead;
      uint16 seenHead;
      uint16 i;
      uint16 j;
      bool liberty;
      bool alreadyVisited;
      i = 0;
      liberty = false;
      seen[seenHead++] = position;
      while (i < seenHead) {
        position = seen[i++];

        // CHECK TOP
        if (position > 18){
          if (game.board[position - 19] == color) {
            alreadyVisited = false;
            for (j=0; j < visitedHead; j++) {
              if (visited[j] == position - 19) {
                alreadyVisited = true;
                break;
              }
            }
            if (!alreadyVisited) {
              seen[seenHead++] = position - 19;
            }
          } else if (liberty == false && game.board[position - 19] == 0) {
            liberty = true;
          }
        }
        // CHECK BOTTOM
        if (position < 342){
          if (game.board[position + 19] == color) {
            alreadyVisited = false;
            for (j=0; j < visitedHead; j++) {
              if (visited[j] == position + 19) {
                alreadyVisited = true;
                break;
              }
            }
            if (!alreadyVisited) {
              seen[seenHead++] = position + 19;
            }
          } else if (liberty == false && game.board[position + 19] == 0) {
            liberty = true;
          }
        }
        // CHECK LEFT
        if (position % 19 != 0){
          if (game.board[position - 1] == color) {
            alreadyVisited = false;
            for (j = 0; j < visitedHead; j++) {
              if (visited[j] == position - 1) {
                alreadyVisited = true;
                break;
              }
            }
            if (!alreadyVisited) {
              seen[seenHead++] = position - 1;
            }
          } else if (liberty == false && game.board[position - 1] == 0) {
            liberty = true;
          }
        }
        // CHECK RIGHT
        if (position % 19 != 18){
          if (game.board[position + 1] == color) {
            alreadyVisited = false;
            for (j = 0; j < visitedHead; j++) {
              if (visited[j] == position + 1) {
                alreadyVisited = true;
                break;
              }
            }
            if (!alreadyVisited) {
              seen[seenHead++] = position + 1;
            }
          } else if (liberty == false && game.board[position + 1] == 0) {
            liberty = true;
          }
        }
        visited[visitedHead++] = position;
      }

      if (liberty == false) {
        for (i = 0; i < visitedHead; i++) {
          game.board[visited[i]] = 0;
        }
      }
    }
  }

  /* changes the state of the game to decide winner after 2 consecutive passes */
  function checkSimpleWinner() private {
    uint score1 = 0;
    uint score2 = 0;
    uint16 i;
    uint8 color;
    for (i = 0; i < 361; i++) {
      color = game.board[i];
      if (color == 1) {
        score1++;
      } else if (color == 2) {
        score2++;
      }
    }
    if (score1 < score2) {
      game.state = 2;
    } else {
      game.state = 1;
    }
  }

  /* returns the current board of the game */
  function getBoard() public view returns (uint8[361]) {
    return game.board;
  }

  /* returns infor mation on the game */
  function getData() public view returns (address, address, uint8, uint8) {
    return (owner, opponent, game.turn, game.state);
  }
}
