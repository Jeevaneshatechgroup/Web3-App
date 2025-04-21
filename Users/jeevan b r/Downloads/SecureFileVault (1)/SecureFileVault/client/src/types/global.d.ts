// Global type definitions for Web3 wallets and related interfaces

interface Window {
  ethereum?: any;
  exodus?: {
    ethereum?: any;
  };
}

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

// Extend the EthereumProvider interface
interface EthereumProvider {
  isExodus?: boolean;
  isMetaMask?: boolean;
  _metamask?: {
    isExodus?: boolean;
  };
  providers?: EthereumProvider[];
  
  request(args: RequestArguments): Promise<unknown>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
}