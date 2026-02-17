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

export interface Scene {
  id: string;
  title: string; // For admin organization
  backgroundUrl: string;
  speakerName: string;
  dialogueText: string;
  characters: Character[];
  choices: Choice[];
}

export interface Story {
  title: string;
  startSceneId: string;
  scenes: Record<string, Scene>;
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
      speakerName: "Неизвестный",
      dialogueText: "Привет! Это начало твоей истории. Куда мы пойдем дальше?",
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
      speakerName: "",
      dialogueText: "Ты заходишь в темный лес. Птицы поют, но тебе тревожно.",
      characters: [],
      choices: [
        { id: "ch3", text: "Вернуться назад", nextSceneId: "start" }
      ]
    },
    "home": {
      id: "home",
      title: "Дом",
      backgroundUrl: "https://picsum.photos/1920/1080",
      speakerName: "Мама",
      dialogueText: "Ты решил остаться дома. Мудрое решение.",
      characters: [
        { id: "c2", name: "Мама", imageUrl: "https://picsum.photos/401/800", position: "right" }
      ],
      choices: [
        { id: "ch4", text: "Начать сначала", nextSceneId: "start" }
      ]
    }
  }
};