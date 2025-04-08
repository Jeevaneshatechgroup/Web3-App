import { useQuery } from "@tanstack/react-query";
import { NFT } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useNFTs = (walletAddress: string | null) => {
  const { toast } = useToast();

  const {
    data: nfts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<NFT[]>({
    queryKey: walletAddress ? [`/api/nfts/${walletAddress}`] : [],
    enabled: !!walletAddress,
    retry: 1,
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to fetch NFTs",
        description: err.message || "There was an error loading your NFTs. Please try again."
      });
    }
  });

  return {
    nfts: nfts || [],
    isLoading,
    isError,
    error,
    refetch
  };
};
