import React, { useState, useEffect } from 'react';
import { Story, Scene } from '../types';
import { Home, RefreshCw, SkipForward, Save } from 'lucide-react';

interface PlayerProps {
  story: Story;
  initialState?: { sceneId: string; stepIndex: number };
  onExit: () => void;
}

export const Player: React.FC<PlayerProps> = ({ story, initialState, onExit }) => {
  // State
  const [currentSceneId, setCurrentSceneId] = useState<string>(initialState?.sceneId || story.startSceneId);
  const [stepIndex, setStepIndex] = useState<number>(initialState?.stepIndex || 0);
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const scene = story.scenes[currentSceneId];
  
  // Safe access to current dialogue line
  const currentDialogue = scene?.script?.[stepIndex];
  // Check if we are at the end of the script (and the current line is done or doesn't exist)
  const isScriptFinished = !currentDialogue && stepIndex >= (scene?.script?.length || 0);

  // If scene is missing (broken link), fallback to start
  useEffect(() => {
    if (!scene) {
      setCurrentSceneId(story.startSceneId);
      setStepIndex(0);
    }
  }, [scene, story.startSceneId]);

  // Typing effect
  useEffect(() => {
    if (!scene || !currentDialogue) return;
    
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = currentDialogue.text;

    const interval = setInterval(() => {
      index++;
      setDisplayedText(fullText.substring(0, index));
      if (index >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [currentSceneId, stepIndex, scene, currentDialogue]);

  // Auto-Save Effect
  useEffect(() => {
    if (scene) {
      const saveData = {
        sceneId: currentSceneId,
        stepIndex: stepIndex,
        date: new Date().toISOString()
      };
      localStorage.setItem('vn_player_save', JSON.stringify(saveData));
    }
  }, [currentSceneId, stepIndex, scene]);

  const handleSceneChoice = (nextId: string) => {
    if (isTyping) {
      completeTyping();
    } else {
      setCurrentSceneId(nextId);
      setStepIndex(0);
    }
  };

  const handleScriptChoice = (nextDialogueId: string) => {
    if (isTyping) return; // Prevent clicking choice while typing (optional, usually safer)
    
    const nextIndex = scene.script.findIndex(line => line.id === nextDialogueId);
    if (nextIndex !== -1) {
      setStepIndex(nextIndex);
    } else {
      // Fallback: just go next if ID not found
      setStepIndex(prev => prev + 1);
    }
  };

  const completeTyping = () => {
    if (currentDialogue) {
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
    }
  };

  const handleScreenClick = () => {
    if (!scene) return;

    if (isTyping) {
      completeTyping();
      return;
    }

    // If current dialogue has inline choices, screen click should NOT advance
    if (currentDialogue?.choices && currentDialogue.choices.length > 0) {
      return;
    }

    // Advance logic
    if (currentDialogue) {
        // Check for auto-jump
        if (currentDialogue.nextDialogueId) {
            const jumpIndex = scene.script.findIndex(l => l.id === currentDialogue.nextDialogueId);
            if (jumpIndex !== -1) {
                setStepIndex(jumpIndex);
                return;
            }
        }
        
        // Standard advance
        if (stepIndex < (scene.script?.length || 0)) {
            setStepIndex(prev => prev + 1);
        }
    }
  };

  const manualSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saveData = {
        sceneId: currentSceneId,
        stepIndex: stepIndex,
        date: new Date().toISOString()
      };
    localStorage.setItem('vn_player_save', JSON.stringify(saveData));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
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

      {/* Save Notification */}
      {showSaveNotification && (
        <div className="absolute top-20 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in z-50">
          Игра сохранена!
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        
        {/* Top Controls */}
        <div className="flex justify-between p-4 pointer-events-auto">
          <button onClick={onExit} className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition">
            <Home size={24} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={manualSave}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition"
              title="Сохранить"
            >
              <Save size={24} />
            </button>
            <button 
              onClick={() => {
                if(confirm("Перезапустить новеллу?")) {
                    setCurrentSceneId(story.startSceneId);
                    setStepIndex(0);
                }
              }}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition"
              title="Рестарт"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {/* INLINE CHOICES (Displayed in center if active) */}
        {!isTyping && currentDialogue?.choices && currentDialogue.choices.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/50 backdrop-blur-sm z-20 animate-fade-in">
             <div className="flex flex-col gap-3 w-full max-w-lg px-4">
                <h3 className="text-center text-white text-xl font-bold mb-4 drop-shadow-md">Выбор</h3>
                {currentDialogue.choices.map((choice) => (
                    <button
                        key={choice.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleScriptChoice(choice.nextDialogueId);
                        }}
                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl transition transform hover:scale-105 font-bold text-lg"
                    >
                        {choice.text}
                    </button>
                ))}
             </div>
          </div>
        )}

        {/* Dialogue Box Area */}
        <div className="w-full pb-8 pt-20 px-4 md:px-12 lg:px-32 flex flex-col items-center justify-end pointer-events-auto">
          
          {/* SCENE CHOICES (End of script) */}
          {/* Only show if we are past the last script line AND not typing */}
          {!isTyping && (stepIndex >= (scene.script?.length || 0)) && scene.choices.length > 0 && (
             <div className="flex flex-col gap-2 mb-6 w-full max-w-2xl animate-fade-in">
               {scene.choices.map((choice) => (
                 <button
                   key={choice.id}
                   onClick={(e) => {
                     e.stopPropagation();
                     handleSceneChoice(choice.nextSceneId);
                   }}
                   className="w-full py-3 px-6 bg-slate-900/90 hover:bg-indigo-600/90 text-indigo-100 hover:text-white border border-indigo-500/30 rounded-lg backdrop-blur-md transition-all duration-200 text-lg font-medium shadow-lg hover:translate-x-2 text-left"
                 >
                   {choice.text}
                 </button>
               ))}
             </div>
          )}

          {/* Text Box */}
          {currentDialogue && (
            <div className="w-full max-w-5xl bg-slate-950/90 border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md min-h-[160px] relative">
              
              {/* Speaker Name Tag */}
              {currentDialogue.speaker && (
                <div className="absolute -top-5 left-8 bg-indigo-600 text-white px-6 py-2 rounded-t-lg rounded-br-lg font-bold shadow-lg text-lg transform -skew-x-6 border-b-2 border-indigo-800">
                   <span className="block transform skew-x-6">{currentDialogue.speaker}</span>
                </div>
              )}

              {/* Main Text */}
              <p className="text-slate-100 text-lg md:text-2xl leading-relaxed font-medium drop-shadow-md">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
              
              {/* Continue indicator - Hide if there are inline choices pending */}
              {!isTyping && (!currentDialogue.choices || currentDialogue.choices.length === 0) && (
                 <div className="absolute bottom-4 right-6 text-slate-500 animate-bounce">
                   {stepIndex < (scene.script?.length || 0) ? (
                     <SkipForward size={24} /> // Next dialogue
                   ) : scene.choices.length === 0 ? (
                     <div className="text-sm">Конец сцены</div>
                   ) : null}
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};