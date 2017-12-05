pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Go.sol";

contract TestReceiveMove {
  Go goGame = Go(DeployedAddresses.Go());
  /*Go goGame = new GO();*/

    // Testing the adopt() function
    function testMovePosition() public {

        uint expected = 8;
        goGame.move(expected);

        uint returnedPos = goGame.getMove(expected);

        Assert.equal(returnedPos, expected, "move should be recorded");
    }
/*
    // Testing retrieval of a single pet's owner
    function testGetAdopterAddressByPetId() {
        // Expected owner is this contract
        address expected = this;

        address adopter = adoption.adopters(8);

        Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
    }

    // Testing retrieval of all pet owners
    function testGetAdopterAddressByPetIdInArray() {
        // Expected owner is this contract
        address expected = this;

        // Store adopters in memory rather than contract's storage
        address[16] memory adopters = adoption.getAdopters();

        Assert.equal(adopters[8], expected, "Owner of pet ID 8 should be recorded.");
    }*/
}
