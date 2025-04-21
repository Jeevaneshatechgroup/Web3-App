const { deployApp } = require('@algo-builder/algob');

async function run(runtimeEnv, deployer) {
  await deployApp(
    deployer,
    {
      appName: 'DecentralizedIdentityFactory',
      sender: deployer.accountsByName.get('admin'),
      localInts: 1,
      localBytes: 1,
      globalInts: 6,
      globalBytes: 6,
      approvalProgram: 'approval-identity-factory.py',
      clearProgram: 'clear.py',
    },
    {}
  );
}

module.exports = { default: run };
