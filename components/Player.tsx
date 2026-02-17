import React, { useState, useEffect } from 'react';
import { Story, Scene } from '../types';
import { Home, RefreshCw, SkipForward } from 'lucide-react';

interface PlayerProps {
  story: Story;
  onExit: () => void;
}

export const Player: React.FC<PlayerProps> = ({ story, onExit }) => {
  const [currentSceneId, setCurrentSceneId] = useState<string>(story.startSceneId);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scene = story.scenes[currentSceneId];

  // If scene is missing (broken link), fallback to start
  useEffect(() => {
    if (!scene) {
      setCurrentSceneId(story.startSceneId);
    }
  }, [scene, story.startSceneId]);

  // Typing effect
  useEffect(() => {
    if (!scene) return;
    
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = scene.dialogueText;

    const interval = setInterval(() => {
      index++;
      setDisplayedText(fullText.substring(0, index));
      if (index >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [currentSceneId, scene]);

  const handleChoice = (nextId: string) => {
    if (isTyping) {
      // Complete text immediately if clicked during typing
      setDisplayedText(scene.dialogueText);
      setIsTyping(false);
    } else {
      setCurrentSceneId(nextId);
    }
  };

  const handleScreenClick = () => {
    if (isTyping && scene) {
      setDisplayedText(scene.dialogueText);
      setIsTyping(false);
    }
  };

  if (!scene) return <div className="text-white">Ошибка сцены...</div>;

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden select-none"
      onClick={handleScreenClick}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${scene.backgroundUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* Characters Layer */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none px-4 md:px-20 pb-0">
        <div className="relative w-full h-full max-w-6xl mx-auto flex items-end justify-between">
          {/* Position Slots: Left, Center, Right */}
          {['left', 'center', 'right'].map((pos) => {
            const char = scene.characters.find(c => c.position === pos);
            return (
              <div key={pos} className={`flex-1 h-[80%] flex items-end ${pos === 'left' ? 'justify-start' : pos === 'right' ? 'justify-end' : 'justify-center'}`}>
                {char && (
                  <img 
                    src={char.imageUrl} 
                    alt={char.name} 
                    className="max-h-full object-contain drop-shadow-2xl animate-fade-in transition-all duration-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        
        {/* Top Controls */}
        <div className="flex justify-between p-4 pointer-events-auto">
          <button onClick={onExit} className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition">
            <Home size={24} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentSceneId(story.startSceneId)}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition"
              title="Рестарт"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {/* Dialogue Box Area */}
        <div className="w-full pb-8 pt-20 px-4 md:px-12 lg:px-32 flex flex-col items-center justify-end pointer-events-auto">
          
          {/* Choices (If text finished) */}
          {!isTyping && scene.choices.length > 0 && (
             <div className="flex flex-col gap-2 mb-6 w-full max-w-2xl animate-fade-in">
               {scene.choices.map((choice) => (
                 <button
                   key={choice.id}
                   onClick={(e) => {
                     e.stopPropagation();
                     handleChoice(choice.nextSceneId);
                   }}
                   className="w-full py-3 px-6 bg-slate-900/90 hover:bg-indigo-600/90 text-indigo-100 hover:text-white border border-indigo-500/30 rounded-lg backdrop-blur-md transition-all duration-200 text-lg font-medium shadow-lg hover:translate-x-2 text-left"
                 >
                   {choice.text}
                 </button>
               ))}
             </div>
          )}

          {/* Text Box */}
          <div className="w-full max-w-5xl bg-slate-950/90 border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md min-h-[160px] relative">
            
            {/* Speaker Name Tag */}
            {scene.speakerName && (
              <div className="absolute -top-5 left-8 bg-indigo-600 text-white px-6 py-2 rounded-t-lg rounded-br-lg font-bold shadow-lg text-lg transform -skew-x-6 border-b-2 border-indigo-800">
                 <span className="block transform skew-x-6">{scene.speakerName}</span>
              </div>
            )}

            {/* Main Text */}
            <p className="text-slate-100 text-lg md:text-2xl leading-relaxed font-medium drop-shadow-md">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
            
            {/* Continue indicator if typing done and no choices (or just to indicate click to skip) */}
            {!isTyping && scene.choices.length === 0 && (
               <div className="absolute bottom-4 right-6 text-slate-500 animate-bounce">
                 <SkipForward size={24} />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};