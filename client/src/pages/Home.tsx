import { useEffect } from "react";
import Header from "@/components/Header";
import NotificationBanner from "@/components/NotificationBanner";
import VotingSection from "@/components/VotingSection";
import Footer from "@/components/Footer";
import TransactionModal from "@/components/TransactionModal";
import { useWeb3 } from "@/context/Web3Context";
import { useVoting } from "@/context/VotingContext";

export default function Home() {
  const { checkMetaMaskInstalled } = useWeb3();
  const { fetchCandidates } = useVoting();
  
  useEffect(() => {
    checkMetaMaskInstalled();
    fetchCandidates();
  }, [checkMetaMaskInstalled, fetchCandidates]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <NotificationBanner />
        <VotingSection />
      </main>
      <Footer />
      <TransactionModal />
    </div>
  );
}
