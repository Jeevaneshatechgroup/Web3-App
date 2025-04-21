const { deployApp } = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');

async function run(runtimeEnv, deployer) {
  await deployApp(
    deployer,
    {
      appName: 'DecentralizedIdentityNFT',
      sender: deployer.accountsByName.get('admin'),
      localInts: 1,
      localBytes: 1,
      globalInts: 2,
      globalBytes: 2,
      approvalProgram: 'approval-identity-nft.py',
      clearProgram: 'clear.py',
    },
    {}
  );
}

module.exports = { default: run };
