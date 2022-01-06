const port = process.env.HOST_PORT || 8090

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
    shasta: {
      privateKey: '595337fabadf6474ed0fdd78abac42f14bc1b6af283f2b7ca468cabe51c178ec',
      userFeePercentage: 50,
      feeLimit: 1e8,
      fullHost: 'https://vtest.infragrid.v.network',
      network_id: '2'
    },
    development: {
      privateKey: 'your private key',
      userFeePercentage: 0,
      feeLimit: 1e8,
      fullHost: 'http://127.0.0.1:' + port,
      network_id: '9'
    },
    compilers: {
      solc: {
        version: '0.5.10'
      }
    }
  }
}
