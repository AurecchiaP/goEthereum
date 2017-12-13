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
    game.board[ 9 + 19 * 3] = 1;
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
    uint x = myPosition%19;
    uint y = (myPosition - (myPosition%19))/19;
    uint myStoneType = game.board[myPosition];
    uint positionToCheck;
    uint i;

    uint[361] memory chain;
    uint chainHead = 0;

    /*FIXME Redundant code */
    /* check position to the left and right */
    positionToCheck = (x-1)+(y*19);
    for(i=0; i<2; i++){
      if (game.board[positionToCheck]!= 0 && game.board[positionToCheck]!= myStoneType) {
        /* found oponent's stone nearby, so now we check if oponent's stone can be captured */
        chain[chainHead] = positionToCheck;
        chainHead = chainHead + 1;
        findChain(chain, chainHead, positionToCheck);
        capture(chain, chainHead);
        delete chain;
        chainHead = 0;

      }
      positionToCheck = (x+1)+(y*19);
    }
    /* check position to the top and bottom */
    positionToCheck = (x)+((y-1)*19);
    for(i=0; i<2; i++){
      if (game.board[positionToCheck]!= 0 && game.board[positionToCheck]!= myStoneType) {
        /* found oponent's stone nearby, so now we check if oponent's stone can be captured */
        chain[chainHead] = positionToCheck;
        chainHead = chainHead + 1;
        findChain(chain, chainHead, positionToCheck);
        capture(chain, chainHead);
        delete chain;
        chainHead = 0;

      }
      positionToCheck = (x)+((y+1)*19);
    }
  }

  /* we now just have to check if any stone in the chain has a liberty. if yes, we do nothing
  else we delete the whole chain.
  REVIEW: do we have to check the colours of the stone (technically if the stone had the same colour
  it would be a part of the chain )
   */
  function capture(uint[361] memory chain, uint chainHead) public {
    uint i;
    uint x;
    uint y;
    bool liberty = false;
    uint up;
    uint down;
    uint left;
    uint right;
    for(i=0;i<chainHead; i++){
      x = chain[i]%19;
      y =(chain[i] - (chain[i]%19))/19;
      up = (x)+((y-1)*19);
      down = (x)+((y+1)*19);
      left = (x-1)+(y*19);
      right = (x+1)+(y*19);
      if(game.board[up] == 0 || game.board[down] == 0 || game.board[left] == 0 || game.board[right] == 0){
        liberty = true;
        return;
      }
    }
    if(liberty==false){
      for(i=0;i<chainHead; i++){
        game.board[chain[i]] = 0;
      }
    }
  }

  function findChain(uint[361] memory chain, uint chainHead, uint startPos) public {
    uint x = startPos%19;
    uint y = (startPos - (startPos%19))/19;
    uint stoneType = game.board[startPos];
    if(y !=0){
      uint up = (x)+((y-1)*19);
      addStoneToChain(chain, chainHead, up, stoneType);
    }
    if( y != 19){
      uint down = (x)+((y+1)*19);
      addStoneToChain(chain, chainHead, down, stoneType);
    }
    if(x != 0){
      uint left = (x-1)+(y*19);
      addStoneToChain(chain, chainHead, left, stoneType);
    }
    if(x != 19){
      uint right = (x+1)+(y*19);
      addStoneToChain(chain, chainHead, right, stoneType);
    }

  }

  function addStoneToChain(uint[361] memory chain, uint chainHead, uint position, uint stoneType) public {
    uint i;
    bool added;
    if(game.board[position] == stoneType && stoneType != 0){ // found a linked stone
      /* check if the stone was already listed in the chain */
      added = false;
      for(i=0; i < chainHead; i++){
        if(chain[i] == position){
          added = true;
        }
      }
      if(added==false){
        chain[chainHead] = position;
        chainHead = chainHead + 1;
        findChain(chain, chainHead, position);
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
