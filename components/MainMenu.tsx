import React, { useEffect, useState } from 'react';
import { Play, Settings, Wrench, RotateCcw } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onContinue: () => void;
  onAdmin: () => void;
  hasSave: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onContinue, onAdmin, hasSave }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://picsum.photos/1920/1080?grayscale)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 z-0" />

      {/* Admin Button */}
      <button 
        onClick={onAdmin}
        className="absolute top-6 right-6 z-20 p-3 bg-slate-800/80 hover:bg-indigo-600 text-slate-200 rounded-full transition-all duration-300 shadow-lg border border-slate-700 hover:border-indigo-400 group"
      >
        <Wrench size={24} className="group-hover:rotate-45 transition-transform" />
      </button>

      {/* Content */}
      <div className="z-10 flex flex-col items-center animate-fade-in text-center px-4 w-full max-w-md">
        <h1 className="font-title text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-400 mb-2 drop-shadow-lg tracking-wider">
          Я НЕ ПРИДУМАЛ
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 font-light tracking-widest uppercase">
          Интерактивная Визуальная Новелла
        </p>

        <div className="flex flex-col gap-4 w-full px-8">
            {hasSave && (
                <button 
                    onClick={onContinue}
                    className="w-full relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:-translate-y-1 active:translate-y-0 group overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <RotateCcw fill="currentColor" size={24} /> Продолжить
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            )}

            <button 
            onClick={onPlay}
            className={`w-full relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:-translate-y-1 active:translate-y-0 group overflow-hidden ${hasSave ? 'bg-slate-700 hover:bg-indigo-500' : ''}`}
            >
            <span className="relative z-10 flex items-center justify-center gap-3">
                <Play fill="currentColor" size={24} /> {hasSave ? 'Новая Игра' : 'Играть'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-slate-600 text-xs">
        v1.1.0 • React Engine
      </div>
    </div>
  );
};