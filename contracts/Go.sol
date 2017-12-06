pragma solidity 0.4.18;

import "./GoGame.sol";


contract Go {
  address public owner;
  address[] games;
  uint c;

  function Go() public {
    owner = msg.sender;
  }

  function newGame() public {
    address game = new GoGame(msg.sender);
    c = c + 1;
    games.push(game);
  }

  function getGames() public view returns (address[]) {
    return games;
  }
}
