// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // to customize your Truffle configuration!
// };


module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545, // This is the Ganache default port. You can change it to the conventional 8545 if your network runs on 8545
      network_id: "5777", // Match any network id. You may need to replace * with your network Id
      from: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", // Add your unlocked account within the double quotes
      gas: 4444444
    }
  }
};
