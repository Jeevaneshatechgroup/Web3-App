// Network-specific contract addresses
// Replace these with actual deployed contract addresses on mainnet or test networks

export const NETWORKS = {
  // Ethereum Mainnet
  1: {
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/'
  },
  // Ethereum Goerli Testnet
  5: {
    name: 'Goerli Testnet',
    explorer: 'https://goerli.etherscan.io',
    rpcUrl: 'https://goerli.infura.io/v3/'
  },
  // Polygon Mainnet
  137: {
    name: 'Polygon Mainnet',
    explorer: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  },
  // Polygon Mumbai Testnet
  80001: {
    name: 'Mumbai Testnet',
    explorer: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com'
  },
  // Arbitrum
  42161: {
    name: 'Arbitrum One',
    explorer: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  // Optimism
  10: {
    name: 'Optimism',
    explorer: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io'
  }
};

// Contract addresses by network (chainId)
export const CONTRACT_ADDRESSES = {
  1: { // Ethereum Mainnet
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  5: { // Goerli Testnet
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  137: { // Polygon Mainnet
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  80001: { // Mumbai Testnet
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  42161: { // Arbitrum
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  10: { // Optimism
    DecentralizedIdentityFactory: '0x0000000000000000000000000000000000000000', // Replace with actual address
  }
};

// Helper function to get contract address by network
export function getContractAddress(contractName: string, chainId: number) {
  // Default to Ethereum mainnet if unknown chain ID
  const networkAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[1];
  return networkAddresses[contractName as keyof typeof networkAddresses] || '0x0000000000000000000000000000000000000000';
}

// Helper function to get network info
export function getNetworkInfo(chainId: number) {
  return NETWORKS[chainId as keyof typeof NETWORKS] || NETWORKS[1];
}

// For local development with Hardhat
export const LOCAL_HARDHAT_CHAIN_ID = 31337;
export const LOCAL_HARDHAT_RPC = 'http://127.0.0.1:8545';

// Add local Hardhat to networks if we're in development
if (import.meta.env.DEV) {
  Object.assign(NETWORKS, {
    [LOCAL_HARDHAT_CHAIN_ID]: {
      name: 'Hardhat Local',
      explorer: '',
      rpcUrl: LOCAL_HARDHAT_RPC
    }
  });

  Object.assign(CONTRACT_ADDRESSES, {
    [LOCAL_HARDHAT_CHAIN_ID]: {
      DecentralizedIdentityFactory: '0x5FbDB2315678afecb367f032d93F642f64180aa3', 
      DecentralizedIdentityNFT: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be', 
      DecentralizedFileSharing: '0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968' 
    }
  });
}
