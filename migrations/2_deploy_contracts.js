var Adoption = artifacts.require("Adoption");
var Go = artifacts.require("Go");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(Go);
};
