import { Candidate } from "@/types";
import { useVoting } from "@/context/VotingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CandidateCardProps {
  candidate: Candidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const { castVote, hasVoted } = useVoting();

  const handleVote = () => {
    castVote(candidate.id);
  };

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={candidate.imageUrl} 
          alt={candidate.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-bold text-lg">{candidate.name}</h3>
          <p className="text-gray-200 text-sm">Proposal #{candidate.id.toString().padStart(3, '0')}</p>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-gray-700 mb-4">{candidate.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-blue-500 font-semibold">Current Votes: </span>
            <span className="font-bold">{candidate.voteCount}</span>
          </div>
          <Button 
            onClick={handleVote}
            disabled={hasVoted}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Vote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
