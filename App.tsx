import React from 'react';
import MapEngine from './components/MapEngine';

const App: React.FC = () => {
  // Hardcoded API key to ensure it works in preview
  const apiKey = "AIzaSyDmgKGPPxu2UZTMQxJFgwB3JFeceq5oSAo";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <MapEngine apiKey={apiKey} />
    </div>
  );
};

export default App;