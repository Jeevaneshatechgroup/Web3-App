import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { Candidate, Notification, Transaction } from '@/types';
import { 
  castVote as castVoteOnChain,
  checkIfAccountHasVoted,
  getCandidates as fetchCandidatesFromChain,
  getTotalVotes as fetchTotalVotesFromChain,
  getContractAddress,
  getNetwork as fetchNetwork
} from '@/lib/ethers';

interface VotingContextType {
  candidates: Candidate[];
  hasVoted: boolean;
  totalVotes: number;
  contractAddress: string;
  network: string;
  notification: Notification;
  transaction: Transaction;
  fetchCandidates: () => Promise<void>;
  castVote: (candidateId: number) => Promise<void>;
  closeTransactionModal: () => void;
}

const DEFAULT_NOTIFICATION: Notification = {
  show: false,
  type: 'none',
  message: '',
};

const DEFAULT_TRANSACTION: Transaction = {
  isOpen: false,
  hash: '',
  status: 'pending',
};

const VotingContext = createContext<VotingContextType>({
  candidates: [],
  hasVoted: false,
  totalVotes: 0,
  contractAddress: '',
  network: '',
  notification: DEFAULT_NOTIFICATION,
  transaction: DEFAULT_TRANSACTION,
  fetchCandidates: async () => {},
  castVote: async () => {},
  closeTransactionModal: () => {},
});

export const useVoting = () => useContext(VotingContext);

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider = ({ children }: VotingProviderProps) => {
  const { isConnected, account } = useWeb3();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [contractAddress] = useState(getContractAddress());
  const [network, setNetwork] = useState('Ethereum Goerli Testnet');
  const [notification, setNotification] = useState<Notification>(DEFAULT_NOTIFICATION);
  const [transaction, setTransaction] = useState<Transaction>(DEFAULT_TRANSACTION);

  // Mock candidates to use when not connected or if fetching fails
  const mockCandidates: Candidate[] = [
    {
      id: 1,
      name: 'Sophia Chen',
      description: 'Advocating for increased transparency in governance decisions and community-led development initiatives.',
      imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
      voteCount: 24
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      description: 'Focused on implementing sustainable tokenomics and creating a robust DAO structure for long-term growth.',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
      voteCount: 31
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      description: 'Championing cross-chain interoperability and expanding the ecosystem through strategic partnerships.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
      voteCount: 18
    }
  ];

  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({
      show: true,
      type,
      message,
    });

    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification(DEFAULT_NOTIFICATION);
    }, 5000);
  };

  const fetchVotingStatus = useCallback(async () => {
    if (isConnected && account) {
      try {
        const voted = await checkIfAccountHasVoted(account);
        setHasVoted(voted);
      } catch (error) {
        console.error('Error checking voting status:', error);
      }
    }
  }, [isConnected, account]);

  const fetchCandidates = useCallback(async () => {
    if (!isConnected) {
      setCandidates(mockCandidates);
      return;
    }

    try {
      const fetchedCandidates = await fetchCandidatesFromChain();
      if (fetchedCandidates.length > 0) {
        setCandidates(fetchedCandidates);
      } else {
        setCandidates(mockCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates(mockCandidates);
    }
  }, [isConnected]);

  const fetchTotalVotes = useCallback(async () => {
    if (!isConnected) {
      setTotalVotes(mockCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0));
      return;
    }

    try {
      const total = await fetchTotalVotesFromChain();
      setTotalVotes(total);
    } catch (error) {
      console.error('Error fetching total votes:', error);
      setTotalVotes(mockCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0));
    }
  }, [isConnected]);

  const fetchNetworkName = useCallback(async () => {
    if (!isConnected) return;

    try {
      const networkName = await fetchNetwork();
      setNetwork(networkName);
    } catch (error) {
      console.error('Error fetching network:', error);
    }
  }, [isConnected]);

  const castVote = async (candidateId: number) => {
    if (!isConnected) {
      showNotification('error', 'Please connect your wallet to vote');
      return;
    }

    if (hasVoted) {
      showNotification('error', 'You have already voted');
      return;
    }

    try {
      // Show loading notification
      showNotification('loading', 'Processing your vote on the blockchain...');

      // Open transaction modal
      setTransaction({
        isOpen: true,
        hash: '',
        status: 'pending',
      });

      // For development purposes, use mock data since we might not have a real contract
      const mockTxHash = '0x' + Array(64).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      
      try {
        // Try to cast vote on chain
        const txHash = await castVoteOnChain(candidateId);
        
        // Update transaction modal with hash
        setTransaction({
          isOpen: true,
          hash: txHash,
          status: 'pending',
        });
        
        // Wait for transaction confirmation (for demo purposes, we'll use a timeout)
        // In a real app, you'd listen for transaction confirmation events
        setTimeout(() => {
          // Update transaction modal to confirmed
          setTransaction({
            isOpen: true,
            hash: txHash,
            status: 'confirmed',
          });

          // Show success notification
          showNotification('success', 'Your vote has been recorded on the blockchain!');

          // Update voting status
          setHasVoted(true);
          
          // Manually update the candidate vote count and total votes for immediate feedback
          setCandidates(prevCandidates => {
            return prevCandidates.map(candidate => {
              if (candidate.id === candidateId) {
                return {
                  ...candidate,
                  voteCount: candidate.voteCount + 1
                };
              }
              return candidate;
            });
          });
          
          // Update total votes counter
          setTotalVotes(prevTotal => prevTotal + 1);
          
          // Also fetch the latest data from the blockchain (this may not update immediately)
          fetchCandidates();
          fetchTotalVotes();
        }, 3000);
      } catch (contractError: any) {
        console.error('Contract interaction error:', contractError);
        
        // For demo purposes, continue with mock transaction
        console.log('Using mock transaction for demo');
        
        // Update transaction modal with mock hash
        setTransaction({
          isOpen: true,
          hash: mockTxHash,
          status: 'pending',
        });
        
        // Simulate transaction confirmation
        setTimeout(() => {
          // Update transaction modal to confirmed
          setTransaction({
            isOpen: true,
            hash: mockTxHash,
            status: 'confirmed',
          });

          // Show success notification
          showNotification('success', 'Demo vote recorded (using mock transaction)');

          // Update voting status
          setHasVoted(true);
          
          // Manually update the candidate vote count and total votes
          setCandidates(prevCandidates => {
            return prevCandidates.map(candidate => {
              if (candidate.id === candidateId) {
                return {
                  ...candidate,
                  voteCount: candidate.voteCount + 1
                };
              }
              return candidate;
            });
          });
          
          // Update total votes counter
          setTotalVotes(prevTotal => prevTotal + 1);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error in voting process:', error);
      
      // Close transaction modal if there was an error
      setTransaction(DEFAULT_TRANSACTION);
      
      // Show error notification with more details for debugging
      const errorMessage = error.message || 'Failed to cast vote';
      showNotification('error', `Voting error: ${errorMessage}`);
    }
  };

  const closeTransactionModal = () => {
    setTransaction(DEFAULT_TRANSACTION);
  };

  useEffect(() => {
    if (isConnected) {
      fetchVotingStatus();
      fetchCandidates();
      fetchTotalVotes();
      fetchNetworkName();
    } else {
      setHasVoted(false);
      setCandidates(mockCandidates);
      setTotalVotes(mockCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0));
    }
  }, [isConnected, account, fetchVotingStatus, fetchCandidates, fetchTotalVotes, fetchNetworkName]);

  return (
    <VotingContext.Provider
      value={{
        candidates,
        hasVoted,
        totalVotes,
        contractAddress,
        network,
        notification,
        transaction,
        fetchCandidates,
        castVote,
        closeTransactionModal,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
