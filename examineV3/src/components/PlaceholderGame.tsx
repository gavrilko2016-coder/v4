import React from 'react';

interface PlaceholderGameProps {
  name: string;
}

export const PlaceholderGame: React.FC<PlaceholderGameProps> = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-fade-in">
      <div className="text-6xl mb-6 animate-bounce">🚧</div>
      <h2 className="text-2xl font-black font-mono mb-2 text-[#00f5ff]">{name}</h2>
      <p className="text-gray-400 font-mono mb-8">This game is currently under development.</p>
      <div className="p-4 rounded-xl border border-[#00f5ff33] bg-[#00f5ff11]">
        <p className="text-sm font-mono text-[#00f5ff]">COMING SOON</p>
      </div>
    </div>
  );
};
