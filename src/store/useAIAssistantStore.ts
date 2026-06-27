import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIAssistantState {
  apiKey: string | null;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  aiResponse: string;
  setApiKey: (key: string) => void;
  setListening: (listening: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setTranscript: (text: string) => void;
  setAiResponse: (text: string) => void;
  clearInteraction: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set) => ({
      apiKey: null,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      transcript: '',
      aiResponse: '',
      setApiKey: (key) => set({ apiKey: key }),
      setListening: (listening) => set({ isListening: listening }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setSpeaking: (speaking) => set({ isSpeaking: speaking }),
      setTranscript: (text) => set({ transcript: text }),
      setAiResponse: (text) => set({ aiResponse: text }),
      clearInteraction: () => set({ transcript: '', aiResponse: '' }),
    }),
    {
      name: 'ai-assistant-storage',
      partialize: (state) => ({ apiKey: state.apiKey }), // Only persist API key
    }
  )
);
