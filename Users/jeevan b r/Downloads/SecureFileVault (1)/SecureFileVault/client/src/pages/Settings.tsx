import { ConnectedWallet } from '@/lib/web3';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, User as UserIcon, Copy, Check, Fingerprint, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';

interface SettingsProps {
  wallet: ConnectedWallet | null;
}

export default function Settings({ wallet }: SettingsProps) {
  const { isCopied: isCopiedAddress, copyToClipboard: copyAddressToClipboard } = useCopyToClipboard();
  const { isCopied: isCopiedDID, copyToClipboard: copyDIDToClipboard } = useCopyToClipboard();
  
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/wallet/${wallet?.address}`],
    enabled: !!wallet?.address
  });
  
  const handleCopyAddress = () => {
    if (!wallet?.address) return;
    copyAddressToClipboard(wallet.address);
  };
  
  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800">Connect your wallet to view settings</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and wallet settings
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Wallet Information
            </CardTitle>
            <CardDescription>
              Your blockchain wallet details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <div className="flex">
                <Input 
                  id="wallet-address" 
                  value={wallet.address} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={handleCopyAddress}
                >
                  {isCopiedAddress ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Network</Label>
              <div className="flex items-center text-sm text-gray-700">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>{wallet.network}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Wallet Type</Label>
              <div className="flex items-center text-sm text-gray-700">
                <div className={`h-2 w-2 ${wallet.walletType === 'exodus' ? 'bg-indigo-500' : 'bg-yellow-500'} rounded-full mr-2`}></div>
                <span>{wallet.walletType === 'exodus' ? 'Exodus Wallet' : 'Other Web3 Wallet'}</span>
                {wallet.walletType !== 'exodus' && (
                  <span className="ml-2 text-xs text-yellow-600">(Exodus recommended for enhanced security)</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* DID Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fingerprint className="mr-2 h-5 w-5" />
              Decentralized Identity (DID)
            </CardTitle>
            <CardDescription>
              Your decentralized identity information powered by Exodus wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Technical Details</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="did-identifier">DID Identifier</Label>
                  <div className="flex">
                    <Input 
                      id="did-identifier" 
                      value={wallet.did.did} 
                      readOnly 
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="ml-2"
                      onClick={() => copyDIDToClipboard(wallet.did.did)}
                    >
                      {isCopiedDID ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Created</Label>
                  <div className="text-sm text-gray-700">
                    {new Date(wallet.did.created).toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>DID Controller</Label>
                  <div className="text-sm text-gray-700 break-all">
                    {wallet.did.controller}
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-indigo-700 font-medium">Enhanced Security & Privacy</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Your decentralized identifier allows secure authentication without sharing personal data.
                        Documents can be signed and verified without relying on central authorities.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>DID Document</Label>
                    <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-64">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                        {JSON.stringify(wallet.did.didDocument, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Verification Methods</Label>
                    <div className="text-sm text-gray-700 space-y-2">
                      {wallet.did.verificationMethod.map((method, index) => (
                        <div key={index} className="bg-gray-50 rounded-md p-2">
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              User Profile (UPCOMING)
            </CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={userData?.username || ''} 
                readOnly 
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Documents</Label>
                <span className="text-sm text-gray-500">12 total</span>
              </div>
              <div className="flex justify-between">
              <Label className="text-success fw-semibold">NFTs Minted</Label>


                <span className="text-sm text-gray-500">3 total</span>
              </div>
              <div className="flex justify-between">
                <Label>Files Shared</Label>
                <span className="text-sm text-gray-500">5 total</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Export Account Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
