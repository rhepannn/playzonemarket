import React, { useState } from 'react';
import { Send } from 'lucide-react';

const InputChat = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="p-6 bg-slate-900/60 backdrop-blur-md border-t border-white/5">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan Sultan..."
          className="flex-1 input-field !py-4 !pl-6 !pr-14 rounded-2xl text-sm md:text-base font-medium shadow-2xl transition-all focus:scale-[1.01]"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()} 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all active:scale-90 shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default InputChat;
