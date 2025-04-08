// Global type declarations for the application

interface ExodusProvider {
  isExodus?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeListener: (event: string, listener: (...args: any[]) => void) => void;
}

interface Window {
  exodus?: {
    ethereum: ExodusProvider;
  };
  ethereum?: ExodusProvider;
}