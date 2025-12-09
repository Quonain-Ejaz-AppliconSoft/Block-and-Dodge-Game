import React from 'react';
import GameCanvas from './components/GameCanvas';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black rounded-lg shadow-2xl border border-slate-800 p-2">
          <GameCanvas />
        </div>
      </div>
      
      <div className="absolute bottom-4 text-slate-500 text-xs text-center">
        <p>Use Arrow Keys or A/D to move</p>
        <p className="mt-1">Dodge the falling blocks</p>
      </div>
    </div>
  );
};

export default App;