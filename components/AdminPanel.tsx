import React, { useState } from 'react';
import { Story, Scene, DialogueLine, Choice, ScriptChoice } from '../types';
import { Plus, Trash2, X, LayoutGrid, MessageSquare, Users, Image as ImageIcon, ArrowRight, Wand2, PlayCircle, MoveDown, MoveUp, GitBranch, CornerDownRight } from 'lucide-react';
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
      script: [{ id: 'd1', speaker: '', text: '...' }],
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
    const prompt = window.prompt("Опишите, что должно происходить в этой сцене (диалоги, сюжет, выборы):");
    if (!prompt) return;

    setIsGenerating(true);
    const result = await generateSceneContent(prompt, currentScene);
    setIsGenerating(false);

    if (result) {
        // Map generated script to includes IDs
        const newScript = result.script?.map(s => ({
            ...s,
            id: s.id || `dia_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        })) as DialogueLine[] | undefined;

        const newChoices = result.choices?.map(c => ({
            ...c,
            id: c.id || `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        })) as Choice[] | undefined;

        updateScene({
            script: newScript || currentScene.script,
            choices: newChoices || currentScene.choices
        });
    } else {
        alert("Не удалось сгенерировать контент. Проверьте API ключ.");
    }
  };

  // --- Dialogue Management ---

  const addDialogueLine = () => {
    const newLine: DialogueLine = {
        id: `d_${Date.now()}`,
        speaker: '',
        text: ''
    };
    updateScene({ script: [...currentScene.script, newLine] });
  };

  const updateDialogueLine = (index: number, updates: Partial<DialogueLine>) => {
    const newScript = [...currentScene.script];
    newScript[index] = { ...newScript[index], ...updates };
    updateScene({ script: newScript });
  };

  const deleteDialogueLine = (index: number) => {
    const newScript = currentScene.script.filter((_, i) => i !== index);
    updateScene({ script: newScript });
  };

  const moveDialogueLine = (index: number, direction: 'up' | 'down') => {
    const newScript = [...currentScene.script];
    if (direction === 'up' && index > 0) {
        [newScript[index], newScript[index - 1]] = [newScript[index - 1], newScript[index]];
    } else if (direction === 'down' && index < newScript.length - 1) {
        [newScript[index], newScript[index + 1]] = [newScript[index + 1], newScript[index]];
    }
    updateScene({ script: newScript });
  };

  // --- Inline Choice Management ---
  const addInlineChoice = (lineIndex: number) => {
      const line = currentScene.script[lineIndex];
      const newChoice: ScriptChoice = {
          id: `sc_${Date.now()}`,
          text: 'Выбор',
          nextDialogueId: line.id // Default to self/current, user must change
      };
      updateDialogueLine(lineIndex, { choices: [...(line.choices || []), newChoice] });
  };

  const removeInlineChoice = (lineIndex: number, choiceIndex: number) => {
      const line = currentScene.script[lineIndex];
      const newChoices = line.choices?.filter((_, i) => i !== choiceIndex);
      updateDialogueLine(lineIndex, { choices: newChoices });
  };

  const updateInlineChoice = (lineIndex: number, choiceIndex: number, field: keyof ScriptChoice, value: string) => {
      const line = currentScene.script[lineIndex];
      if (!line.choices) return;
      const newChoices = [...line.choices];
      newChoices[choiceIndex] = { ...newChoices[choiceIndex], [field]: value };
      updateDialogueLine(lineIndex, { choices: newChoices });
  };

  return (
    <div className="flex w-full h-full bg-slate-900 text-slate-200 overflow-hidden">
      {/* Sidebar - Grid of Scenes */}
      <div className="w-72 flex flex-col border-r border-slate-700 bg-slate-900 flex-shrink-0">
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
                 <div className="bg-slate-700 px-1 rounded text-[10px] text-slate-300">{scene.script.length} фраз</div>
                 <div className="flex gap-1 items-center">
                    {scene.choices.map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    ))}
                 </div>
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
                {isGenerating ? "Генерирую..." : "AI Помощник"}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Dialogue Script */}
            <div className="space-y-6">
              
              {/* Background */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2"><ImageIcon size={18}/> Фон</h3>
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    value={currentScene.backgroundUrl}
                    onChange={(e) => updateScene({ backgroundUrl: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-indigo-500 outline-none"
                    placeholder="URL изображения"
                    />
                </div>
                <div className="w-full h-24 bg-slate-800 rounded mt-2 overflow-hidden relative group">
                   <img src={currentScene.backgroundUrl} className="w-full h-full object-cover opacity-75" alt="preview" />
                </div>
              </div>

              {/* Dialogue Script Editor */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-indigo-400 font-bold flex items-center gap-2"><MessageSquare size={18}/> Сценарий диалогов</h3>
                    <button 
                        onClick={addDialogueLine}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
                    >
                        + Фраза
                    </button>
                </div>
                
                <div className="space-y-3">
                    {currentScene.script.map((line, idx) => (
                        <div key={line.id} className="bg-slate-950 p-3 rounded border border-slate-700/50 flex flex-col gap-2 relative group">
                            {/* Line Header */}
                            <div className="flex justify-between items-center gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-1 rounded">{line.id}</span>
                                    <input 
                                        value={line.speaker}
                                        onChange={(e) => updateDialogueLine(idx, { speaker: e.target.value })}
                                        placeholder="Имя"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold w-32 focus:border-indigo-500 outline-none text-indigo-300"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveDialogueLine(idx, 'up')} disabled={idx === 0} className="p-1 hover:text-white disabled:opacity-20 text-slate-500"><MoveUp size={14}/></button>
                                    <button onClick={() => moveDialogueLine(idx, 'down')} disabled={idx === currentScene.script.length - 1} className="p-1 hover:text-white disabled:opacity-20 text-slate-500"><MoveDown size={14}/></button>
                                    <button onClick={() => deleteDialogueLine(idx)} className="p-1 hover:text-red-400 ml-2 text-slate-500"><Trash2 size={14}/></button>
                                </div>
                            </div>

                            {/* Text Content */}
                            <textarea 
                                value={line.text}
                                onChange={(e) => updateDialogueLine(idx, { text: e.target.value })}
                                placeholder="Текст диалога..."
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none h-20 resize-none mb-2"
                            />

                            {/* Branching Logic Section */}
                            <div className="border-t border-slate-800 pt-2 mt-1">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1"><GitBranch size={12}/> Ветвление</div>
                                    <button 
                                        onClick={() => addInlineChoice(idx)}
                                        className="text-[10px] bg-slate-800 hover:bg-indigo-600 px-2 py-0.5 rounded border border-slate-700 transition"
                                    >
                                        + Выбор игрока
                                    </button>
                                </div>

                                {/* Inline Choices */}
                                {line.choices && line.choices.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                        {line.choices.map((choice, cIdx) => (
                                            <div key={choice.id} className="flex gap-1 items-center">
                                                <input 
                                                    value={choice.text}
                                                    onChange={(e) => updateInlineChoice(idx, cIdx, 'text', e.target.value)}
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
                                                    placeholder="Текст выбора"
                                                />
                                                <ArrowRight size={12} className="text-slate-600"/>
                                                <select 
                                                    value={choice.nextDialogueId}
                                                    onChange={(e) => updateInlineChoice(idx, cIdx, 'nextDialogueId', e.target.value)}
                                                    className="w-24 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[10px] font-mono"
                                                >
                                                    {currentScene.script.map(l => (
                                                        <option key={l.id} value={l.id}>To: {l.id}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => removeInlineChoice(idx, cIdx)} className="text-slate-500 hover:text-red-400"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Auto-Jump Logic */}
                                <div className="flex items-center gap-2">
                                    <CornerDownRight size={12} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-400">После этой фразы переход к:</span>
                                    <select 
                                        value={line.nextDialogueId || ""}
                                        onChange={(e) => updateDialogueLine(idx, { nextDialogueId: e.target.value || undefined })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-indigo-300"
                                    >
                                        <option value="">(Следующая по списку)</option>
                                        {currentScene.script.map(l => (
                                            <option key={l.id} value={l.id}>{l.id} ({l.text.substring(0, 10)}...)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                    {currentScene.script.length === 0 && (
                        <div className="text-center text-slate-600 py-4 italic text-sm">
                            Нет диалогов. Нажмите "+ Фраза".
                        </div>
                    )}
                </div>
              </div>

            </div>

            {/* Column 2: Characters & Scene Choices */}
            <div className="space-y-6">
              
              {/* Characters */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Users size={18}/> Персонажи</h3>
                  <button 
                    onClick={() => updateScene({ 
                        characters: [...currentScene.characters, { id: Date.now().toString(), name: 'Char', imageUrl: 'https://picsum.photos/400/800', position: 'center' }]
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

              {/* Choices / Branching (SCENE LEVEL) */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                 <div className="flex justify-between items-center mb-3">
                  <h3 className="text-indigo-400 font-bold flex items-center gap-2"><ArrowRight size={18}/> Переход в след. сцену</h3>
                  <button 
                    onClick={() => updateScene({ 
                        choices: [...currentScene.choices, { id: Date.now().toString(), text: 'Далее...', nextSceneId: story.startSceneId }]
                    })}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-600"
                  >
                    + Кнопка
                  </button>
                </div>
                
                <div className="text-xs text-slate-500 mb-2">
                    Эти кнопки появятся только когда весь диалог сцены закончится.
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
                        Нет переходов. Сцена будет тупиковой.
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