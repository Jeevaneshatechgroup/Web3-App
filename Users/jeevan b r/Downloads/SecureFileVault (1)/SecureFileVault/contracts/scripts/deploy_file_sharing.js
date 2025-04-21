const { deployApp } = require('@algo-builder/algob');

async function run(runtimeEnv, deployer) {
  await deployApp(
    deployer,
    {
      appName: 'DecentralizedFileSharing',
      sender: deployer.accountsByName.get('admin'),
      localInts: 1,
      localBytes: 1,
      globalInts: 4,
      globalBytes: 4,
      approvalProgram: 'approval-file-sharing.py',
      clearProgram: 'clear.py',
    },
    {}
  );
}

module.exports = { default: run };
