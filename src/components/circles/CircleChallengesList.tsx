import React, { useState, useEffect } from 'react';
import { circleChallengesService } from '../../services/circleChallenges';
import { CircleChallenge } from '../../types';

interface CircleChallengesListProps {
  circleId: string;
}

export const CircleChallengesList: React.FC<CircleChallengesListProps> = ({ circleId }) => {
  const [challenges, setChallenges] = useState<CircleChallenge[]>([]);

  useEffect(() => {
    circleChallengesService.getChallenges(circleId).then(setChallenges);
  }, [circleId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Circle Challenges</h2>
      {challenges.map(c => (
        <div key={c.id} className="mb-2 p-2 border rounded">
          <h3 className="font-semibold">{c.title}</h3>
          <p className="text-sm text-gray-600">{c.description}</p>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Target Streak: {c.goal_streak}</span>
        </div>
      ))}
    </div>
  );
};
