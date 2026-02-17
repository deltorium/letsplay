import React, { useState } from 'react';
import { Story, Scene, Character, Choice } from '../types';
import { Plus, Trash2, Save, X, LayoutGrid, MessageSquare, Users, Image as ImageIcon, ArrowRight, Wand2, PlayCircle } from 'lucide-react';
import { generateSceneContent } from '../services/geminiService';

interface AdminPanelProps {
  story: Story;
  onUpdateStory: (newStory: Story) => void;
  onExit: () => void;
  onPlayTest: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ story, onUpdateStory, onExit, onPlayTest }) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(story.startSceneId);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fix: Explicitly cast to Scene[] to prevent type inference issues where Object.values returns unknown[]
  const scenesList = Object.values(story.scenes) as Scene[];
  const currentScene = story.scenes[selectedSceneId];

  const updateScene = (updates: Partial<Scene>) => {
    if (!currentScene) return;
    const updatedScene = { ...currentScene, ...updates };
    onUpdateStory({
      ...story,
      scenes: {
        ...story.scenes,
        [currentScene.id]: updatedScene
      }
    });
  };

  const addScene = () => {
    const newId = `scene_${Date.now()}`;
    const newScene: Scene = {
      id: newId,
      title: 'Новая сцена',
      backgroundUrl: 'https://picsum.photos/1920/1080',
      speakerName: '',
      dialogueText: '...',
      characters: [],
      choices: []
    };
    onUpdateStory({
      ...story,
      scenes: { ...story.scenes, [newId]: newScene }
    });
    setSelectedSceneId(newId);
  };

  const deleteScene = (id: string) => {
    if (id === story.startSceneId) {
      alert("Нельзя удалить стартовую сцену!");
      return;
    }
    if (confirm("Вы уверены, что хотите удалить эту сцену?")) {
      const newScenes = { ...story.scenes };
      delete newScenes[id];
      onUpdateStory({ ...story, scenes: newScenes });
      setSelectedSceneId(story.startSceneId);
    }
  };

  const handleAiGenerate = async () => {
    const prompt = window.prompt("Опишите, что должно происходить в этой сцене (диалог, выборы):");
    if (!prompt) return;

    setIsGenerating(true);
    const result = await generateSceneContent(prompt, currentScene);
    setIsGenerating(false);

    if (result) {
        // If choices are returned, we need to ensure unique IDs for them
        const choices = result.choices?.map(c => ({
            ...c,
            id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            // If the AI suggests a nextSceneId that doesn't exist, we keep it as text but logic would fail if not handled.
            // For safety, let's just accept the string ID. User can fix it in UI.
        })) as Choice[] | undefined;

        updateScene({
            ...result,
            choices: choices || currentScene.choices
        });
    } else {
        alert("Не удалось сгенерировать контент. Проверьте API ключ.");
    }
  };

  return (
    <div className="flex w-full h-full bg-slate-900 text-slate-200 overflow-hidden">
      {/* Sidebar - Grid of Scenes */}
      <div className="w-80 flex flex-col border-r border-slate-700 bg-slate-900 flex-shrink-0">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="font-bold flex items-center gap-2"><LayoutGrid size={18}/> Сцены</h2>
          <button onClick={addScene} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition">
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-2">
          {scenesList.map(scene => (
            <div 
              key={scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-800 flex flex-col gap-2 relative ${selectedSceneId === scene.id ? 'border-indigo-500 bg-slate-800' : 'border-slate-700 bg-slate-900/50'}`}
            >
               <div className="flex justify-between items-start">
                  <span className="font-bold text-sm truncate pr-6">{scene.title}</span>
                  {scene.id !== story.startSceneId && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                      className="text-slate-500 hover:text-red-400 absolute top-3 right-3"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
               </div>
               <div className="text-xs text-slate-500 truncate font-mono">{scene.id}</div>
               <div className="flex gap-1 mt-1">
                 {scene.choices.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"></div>
                 ))}
                 {scene.choices.length === 0 && <div className="w-2 h-2 rounded-full bg-red-400"></div>}
               </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800 flex gap-2">
             <button onClick={onExit} className="flex-1 py-2 px-4 rounded bg-slate-700 hover:bg-slate-600 transition text-sm">
                Выход
             </button>
             <button onClick={onPlayTest} className="flex-1 py-2 px-4 rounded bg-green-600 hover:bg-green-500 transition text-sm flex justify-center items-center gap-2">
                <PlayCircle size={16}/> Тест
             </button>
        </div>
      </div>

      {/* Main Editor Area */}
      {currentScene ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Editor Toolbar */}
          <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900">
             <div className="flex items-center gap-4">
               <span className="text-slate-500">ID: <span className="text-slate-300 font-mono">{currentScene.id}</span></span>
               <input 
                 value={currentScene.title} 
                 onChange={(e) => updateScene({ title: e.target.value })}
                 className="bg-transparent border-b border-slate-700 focus:border-indigo-500 outline-none text-lg font-bold px-2 py-1 w-64 transition-colors"
                 placeholder="Название сцены"
               />
             </div>
             
             <button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50"
             >
                <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
                {isGenerating ? "Генерирую..." : "AI Генерация"}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Visuals & Text */}
            <div className="space-y-6">
              
              {/* Background */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2"><ImageIcon size={18}/> Фон</h3>
                <input 
                  type="text" 
                  value={currentScene.backgroundUrl}
                  onChange={(e) => updateScene({ backgroundUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-indigo-500 outline-none mb-2"
                  placeholder="URL изображения"
                />
                <div className="w-full h-32 bg-slate-800 rounded overflow-hidden relative">
                   <img src={currentScene.backgroundUrl} className="w-full h-full object-cover opacity-75" alt="preview" />
                   <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-black/50 opacity-0 hover:opacity-100 transition">Предпросмотр</div>
                </div>
              </div>

              {/* Dialogue */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex-1">
                <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2"><MessageSquare size={18}/> Диалог</h3>
                <div className="mb-3">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Имя говорящего</label>
                  <input 
                    type="text" 
                    value={currentScene.speakerName}
                    onChange={(e) => updateScene({ speakerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-indigo-500 outline-none"
                    placeholder="Например: Незнакомец"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Текст</label>
                  <textarea 
                    value={currentScene.dialogueText}
                    onChange={(e) => updateScene({ dialogueText: e.target.value })}
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-indigo-500 outline-none resize-none"
                    placeholder="Что говорит персонаж?"
                  />
                </div>
              </div>

            </div>

            {/* Column 2: Characters & Branching */}
            <div className="space-y-6">
              
              {/* Characters */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Users size={18}/> Персонажи</h3>
                  <button 
                    onClick={() => updateScene({ 
                        characters: [...currentScene.characters, { id: Date.now().toString(), name: 'New Char', imageUrl: 'https://picsum.photos/400/800', position: 'center' }]
                    })}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-600"
                  >
                    + Добавить
                  </button>
                </div>
                <div className="space-y-2">
                  {currentScene.characters.map((char, idx) => (
                    <div key={char.id} className="flex gap-2 items-center bg-slate-950 p-2 rounded border border-slate-800">
                       <img src={char.imageUrl} className="w-8 h-12 object-cover rounded bg-slate-800" />
                       <div className="flex-1 grid grid-cols-2 gap-2">
                          <input 
                            value={char.imageUrl} 
                            onChange={(e) => {
                                const newChars = [...currentScene.characters];
                                newChars[idx].imageUrl = e.target.value;
                                updateScene({ characters: newChars });
                            }}
                            className="text-xs bg-slate-900 border border-slate-700 rounded px-1"
                            placeholder="URL IMG"
                          />
                           <select 
                             value={char.position}
                             onChange={(e) => {
                                const newChars = [...currentScene.characters];
                                newChars[idx].position = e.target.value as any;
                                updateScene({ characters: newChars });
                             }}
                             className="text-xs bg-slate-900 border border-slate-700 rounded px-1"
                           >
                             <option value="left">Слева</option>
                             <option value="center">Центр</option>
                             <option value="right">Справа</option>
                           </select>
                       </div>
                       <button 
                         onClick={() => {
                            const newChars = currentScene.characters.filter((_, i) => i !== idx);
                            updateScene({ characters: newChars });
                         }}
                         className="text-slate-500 hover:text-red-400"
                       >
                         <X size={14}/>
                       </button>
                    </div>
                  ))}
                  {currentScene.characters.length === 0 && <div className="text-slate-600 text-sm italic text-center py-2">Нет персонажей</div>}
                </div>
              </div>

              {/* Choices / Branching */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                 <div className="flex justify-between items-center mb-3">
                  <h3 className="text-indigo-400 font-bold flex items-center gap-2"><ArrowRight size={18}/> Выборы (Ветвление)</h3>
                  <button 
                    onClick={() => updateScene({ 
                        choices: [...currentScene.choices, { id: Date.now().toString(), text: 'Далее...', nextSceneId: story.startSceneId }]
                    })}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-600"
                  >
                    + Добавить
                  </button>
                </div>
                
                <div className="space-y-3">
                  {currentScene.choices.map((choice, idx) => (
                    <div key={choice.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex flex-col gap-2">
                       <div className="flex gap-2">
                         <input 
                           value={choice.text}
                           onChange={(e) => {
                             const newChoices = [...currentScene.choices];
                             newChoices[idx].text = e.target.value;
                             updateScene({ choices: newChoices });
                           }}
                           className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                           placeholder="Текст кнопки"
                         />
                         <button 
                            onClick={() => {
                                const newChoices = currentScene.choices.filter((_, i) => i !== idx);
                                updateScene({ choices: newChoices });
                            }}
                            className="text-slate-600 hover:text-red-400"
                         >
                            <Trash2 size={16}/>
                         </button>
                       </div>
                       
                       <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>Ведет к:</span>
                          <select 
                            value={choice.nextSceneId}
                            onChange={(e) => {
                                const newChoices = [...currentScene.choices];
                                newChoices[idx].nextSceneId = e.target.value;
                                updateScene({ choices: newChoices });
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-indigo-300 font-mono text-xs"
                          >
                            {scenesList.map(s => (
                                <option key={s.id} value={s.id}>{s.title} ({s.id})</option>
                            ))}
                          </select>
                       </div>
                    </div>
                  ))}
                  {currentScene.choices.length === 0 && (
                     <div className="text-orange-400/50 text-xs italic border border-orange-900/30 bg-orange-900/10 p-2 rounded text-center">
                        Нет выборов. Сцена будет тупиковой или просто покажет кнопку "Далее" если это линейный сюжет? (Добавьте хотя бы 1 выбор)
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600">
           Выберите сцену для редактирования
        </div>
      )}
    </div>
  );
};
