pragma solidity 0.4.18;

import "./GoGame.sol";


contract Go {
  address public owner;
  address[] games; // holds the array of addresses of the created games

  function Go() public {
    owner = msg.sender;
  }

  /* creates a new instance of GoGame.sol (a go game) and stores its address
     in 'games' */
  function newGame() public {
    address game = new GoGame(msg.sender);
    games.push(game);
  }

  /* returns the array of addresses of the created games */
  function getGames() public view returns (address[]) {
    return games;
  }
}
