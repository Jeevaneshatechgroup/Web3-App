// Using ExodusProvider interface from declarations.d.ts
interface RequestArguments {
  method: string;
  params?: any[];
}

// Check if Exodus wallet is available
export const getExodusProvider = (): ExodusProvider | null => {
  if (window.exodus?.ethereum) {
    return window.exodus.ethereum;
  }
  
  if (window.ethereum?.isExodus) {
    return window.ethereum;
  }
  
  return null;
};

// Connect to Exodus wallet
export const connectExodusWallet = async (): Promise<string[]> => {
  const provider = getExodusProvider();
  
  if (!provider) {
    throw new Error('Exodus wallet not found. Please install the Exodus browser extension.');
  }
  
  try {
    // Request account access
    const accounts = await provider.request({ 
      method: 'eth_requestAccounts' 
    });
    
    return accounts;
  } catch (error: any) {
    console.error('Error connecting to Exodus wallet:', error);
    throw new Error(error.message || 'Failed to connect to Exodus wallet');
  }
};

// Get network version
export const getNetworkVersion = async (): Promise<string> => {
  const provider = getExodusProvider();
  
  if (!provider) {
    throw new Error('Exodus wallet not found');
  }
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting network version:', error);
    throw new Error('Failed to get network version');
  }
};

// Get accounts
export const getAccounts = async (): Promise<string[]> => {
  const provider = getExodusProvider();
  
  if (!provider) {
    throw new Error('Exodus wallet not found');
  }
  
  try {
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw new Error('Failed to get accounts');
  }
};

// Send transaction
export const sendTransaction = async (txParams: any): Promise<string> => {
  const provider = getExodusProvider();
  
  if (!provider) {
    throw new Error('Exodus wallet not found');
  }
  
  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    });
    
    return txHash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction');
  }
};

export default {
  getExodusProvider,
  connectExodusWallet,
  getNetworkVersion,
  getAccounts,
  sendTransaction,
};
