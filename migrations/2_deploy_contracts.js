var Adoption = artifacts.require("Adoption");
var Go = artifacts.require("Go");
var GoGame = artifacts.require("GoGame");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(Go);
  deployer.deploy(GoGame);
};
