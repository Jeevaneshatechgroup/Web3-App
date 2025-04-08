export default function VotingRules() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-700 mb-2">Voting Rules</h4>
      <ul className="text-sm text-gray-600 space-y-2">
        <li className="flex items-start">
          <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
          <span>Each wallet address can vote only once</span>
        </li>
        <li className="flex items-start">
          <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
          <span>Voting requires a small amount of gas (network fee)</span>
        </li>
        <li className="flex items-start">
          <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
          <span>Votes are permanently recorded on the blockchain and cannot be changed</span>
        </li>
        <li className="flex items-start">
          <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
          <span>Voting period ends on July 15, 2023 at 11:59 PM UTC</span>
        </li>
      </ul>
    </div>
  );
}
