export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  position: 'left' | 'center' | 'right';
}

export interface ScriptChoice {
  id: string;
  text: string;
  nextDialogueId: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  choices?: ScriptChoice[];
  nextDialogueId?: string; // For auto-jumping after this line (merging branches)
}

export interface Scene {
  id: string;
  title: string;
  backgroundUrl: string;
  script: DialogueLine[]; 
  characters: Character[];
  choices: Choice[]; // Scene-level choices (at the end)
}

export interface Story {
  title: string;
  startSceneId: string;
  scenes: Record<string, Scene>;
}

export interface PlayerSave {
  sceneId: string;
  stepIndex: number;
  date: string;
}

export type AppMode = 'HOME' | 'PLAY' | 'ADMIN_LOGIN' | 'ADMIN';

export const DEFAULT_STORY: Story = {
  title: "Моя Первая Новелла",
  startSceneId: "start",
  scenes: {
    "start": {
      id: "start",
      title: "Начало",
      backgroundUrl: "https://picsum.photos/1920/1080?grayscale",
      script: [
        { id: "d1", speaker: "Неизвестный", text: "Привет! Это начало твоей истории." },
        { 
          id: "d2", 
          speaker: "Система", 
          text: "Ты хочешь пройти обучение?",
          choices: [
            { id: "sc1", text: "Да, покажи как", nextDialogueId: "d3" },
            { id: "sc2", text: "Нет, я сам", nextDialogueId: "d4" }
          ]
        },
        { id: "d3", speaker: "Система", text: "Отлично! Просто нажимай на экран.", nextDialogueId: "d5" },
        { id: "d4", speaker: "Система", text: "Смело. Удачи!", nextDialogueId: "d5" },
        { id: "d5", speaker: "Голос в голове", text: "Теперь мы готовы идти дальше." }
      ],
      characters: [
        { id: "c1", name: "Девушка", imageUrl: "https://picsum.photos/400/800", position: "center" }
      ],
      choices: [
        { id: "ch1", text: "Пойти в лес", nextSceneId: "forest" },
        { id: "ch2", text: "Остаться дома", nextSceneId: "home" }
      ]
    },
    "forest": {
      id: "forest",
      title: "Лес",
      backgroundUrl: "https://picsum.photos/1920/1080?blur=2",
      script: [
         { id: "d1", speaker: "", text: "Ты заходишь в темный лес." },
         { id: "d2", speaker: "", text: "Птицы поют, но тебе тревожно." }
      ],
      characters: [],
      choices: [
        { id: "ch3", text: "Вернуться назад", nextSceneId: "start" }
      ]
    },
    "home": {
      id: "home",
      title: "Дом",
      backgroundUrl: "https://picsum.photos/1920/1080",
      script: [
         { id: "d1", speaker: "Мама", text: "Ты решил остаться дома." },
         { id: "d2", speaker: "Мама", text: "Мудрое решение, сынок." }
      ],
      characters: [
        { id: "c2", name: "Мама", imageUrl: "https://picsum.photos/401/800", position: "right" }
      ],
      choices: [
        { id: "ch4", text: "Начать сначала", nextSceneId: "start" }
      ]
    }
  }
};