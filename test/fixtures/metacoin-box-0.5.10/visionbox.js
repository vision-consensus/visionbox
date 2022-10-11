const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      /*
Create a .env file (it must be gitignored) containing something like

  export PRIVATE_KEY_MAINNET=4E7FECCB71207B867C495B51A9758B104B1D4422088A87F4978BE64636656243

Then, run the migration with:

  source .env && visionbox migrate --network mainnet

*/
      userFeePercentage: 100,
      feeLimit: 1e8,
      fullHost: 'https://vtest.infragrid.v.network',
      network_id: '1'
    },
    compilers: {
      solc: {
        // version: '0.5.10'
        version: '0.8.8'
      }
    }
  }
}
