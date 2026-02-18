import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { Player } from './components/Player';
import { AdminPanel } from './components/AdminPanel';
import { AppMode, Story, DEFAULT_STORY } from './types';
import { Lock } from 'lucide-react';

const ADMIN_PIN = "050412";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('HOME');
  const [story, setStory] = useState<Story>(DEFAULT_STORY);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [loadFromSave, setLoadFromSave] = useState(false);

  // Persistence for Story Data
  useEffect(() => {
    const savedStory = localStorage.getItem('vn_story_data');
    if (savedStory) {
      try {
        setStory(JSON.parse(savedStory));
      } catch (e) {
        console.error("Failed to load story", e);
      }
    }
    
    // Check for player save
    const playerSave = localStorage.getItem('vn_player_save');
    if (playerSave) {
        setHasSave(true);
    }
  }, [mode]); // Re-check on mode change (e.g. going back to home)

  const handleUpdateStory = (newStory: Story) => {
    setStory(newStory);
    localStorage.setItem('vn_story_data', JSON.stringify(newStory));
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setMode('ADMIN');
      setPinInput("");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handlePlayNew = () => {
    setLoadFromSave(false);
    // Optional: Clear save? Maybe not, just overwrite when they start playing.
    setMode('PLAY');
  };

  const handleContinue = () => {
    setLoadFromSave(true);
    setMode('PLAY');
  };

  const getInitialPlayerState = () => {
      if (loadFromSave) {
          const savedData = localStorage.getItem('vn_player_save');
          if (savedData) {
              try {
                  const { sceneId, stepIndex } = JSON.parse(savedData);
                  return { sceneId, stepIndex };
              } catch (e) {
                  console.error("Error loading save", e);
              }
          }
      }
      return undefined;
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white">
      {mode === 'HOME' && (
        <MainMenu 
          onPlay={handlePlayNew}
          onContinue={handleContinue} 
          onAdmin={() => setMode('ADMIN_LOGIN')}
          hasSave={hasSave}
        />
      )}

      {mode === 'PLAY' && (
        <Player 
          story={story} 
          initialState={getInitialPlayerState()}
          onExit={() => setMode('HOME')}
        />
      )}

      {mode === 'ADMIN_LOGIN' && (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
          <button 
            onClick={() => setMode('HOME')} 
            className="absolute top-4 left-4 text-slate-400 hover:text-white"
          >
            ← Назад
          </button>
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-white">Доступ Разработчика</h2>
            <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className={`w-full text-center text-3xl tracking-[1em] py-4 bg-slate-900 border-2 rounded-xl focus:outline-none transition-colors ${pinError ? 'border-red-500 text-red-500' : 'border-slate-600 text-white focus:border-indigo-500'}`}
                placeholder="••••••"
                autoFocus
              />
              {pinError && <p className="text-red-400 text-sm">Неверный код доступа</p>}
              <button type="submit" className="hidden">Unlock</button>
            </form>
          </div>
        </div>
      )}

      {mode === 'ADMIN' && (
        <AdminPanel 
          story={story} 
          onUpdateStory={handleUpdateStory} 
          onExit={() => setMode('HOME')}
          onPlayTest={() => setMode('PLAY')}
        />
      )}
    </div>
  );
};

export default App;