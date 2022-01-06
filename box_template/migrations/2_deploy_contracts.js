// var C05ERC20FixedSupply = artifacts.require("./05ERC20FixedSupply.sol");
// var C05ERC721Full = artifacts.require("./05ERC721Full.sol");
// var C05SimpleVrc20 = artifacts.require("./05SimpleVrc20.sol");
var C08ERC20Mintable = artifacts.require("./08ERC20Mintable.sol");
var C08ERC20PresetFixedSupply = artifacts.require("./08ERC20PresetFixedSupply.sol");
var C08ERC721PresetMinterPauserAutoId = artifacts.require("./08ERC721PresetMinterPauserAutoId.sol");

module.exports = function(deployer) {
  // deployer.deploy(C05ERC20FixedSupply);
  // deployer.deploy(C05ERC721Full);
  // deployer.deploy(C05SimpleVrc20);
  deployer.deploy(C08ERC20Mintable);
  deployer.deploy(C08ERC20PresetFixedSupply);
  deployer.deploy(C08ERC721PresetMinterPauserAutoId);
};
