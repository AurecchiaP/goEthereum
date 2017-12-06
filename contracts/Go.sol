pragma solidity 0.4.18;

import "./GoGame.sol";


contract Go {
  address public owner;
  address[] games;

  function Go() public {
    owner = msg.sender;
  }

  function newGame() public {
    address game = new GoGame(msg.sender);
    games.push(game);
  }

  function getGames() public view returns (address[]) {
    return games;
  }
}
