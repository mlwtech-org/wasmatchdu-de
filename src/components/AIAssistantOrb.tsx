import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Key, X, Loader2, Play } from 'lucide-react';
import { useAIAssistantStore } from '../store/useAIAssistantStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// SpeechRecognition Types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const AIAssistantOrb: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    isListening,
    setListening,
    isProcessing,
    setProcessing,
    isSpeaking,
    setSpeaking,
    transcript,
    setTranscript,
    aiResponse,
    setAiResponse,
    clearInteraction
  } = useAIAssistantStore();
  
  const { channels, setCurrentChannel, setSelectedGroup } = usePlayerStore();
  
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: { error: string }) => {
        console.error('Speech recognition error', event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      clearInteraction();
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = async (command: string) => {
    setProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const channelNames = channels.map(c => c.name).join(", ");
      const systemPrompt = `You are an AI IPTV Assistant. The user said: "${command}".
      Available channels: ${channelNames.substring(0, 500)}... (truncated if long).
      If the user wants to play a specific channel or category, respond with a JSON object exactly like this:
      {"action": "play_channel", "channel_name": "Exact Name from list", "response": "Sure, playing XYZ"}
      If you are just chatting or making a recommendation, respond with JSON like this:
      {"action": "chat", "response": "I recommend checking out the Sports channels!"}
      Always return raw valid JSON.`;

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      setAiResponse(parsed.response);
      speakText(parsed.response);

      if (parsed.action === 'play_channel' && parsed.channel_name) {
        const targetChannel = channels.find(c => 
          c.name.toLowerCase().includes(parsed.channel_name.toLowerCase())
        );
        if (targetChannel) {
          setCurrentChannel(targetChannel);
          // Auto switch to default playlist layout if not already
          if (targetChannel.group) {
              setSelectedGroup(targetChannel.group);
          }
        }
      }

    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Sorry, I had trouble understanding that.");
      speakText("Sorry, I had trouble understanding that.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                Configure AI Agent
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              To use the free voice assistant, please provide a Gemini API Key. You can get one for free from Google AI Studio.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white mb-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setApiKey(tempKey);
                setShowKeyModal(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Floating Orb */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
        
        {/* Interaction Bubble */}
        {(transcript || aiResponse || isProcessing) && (
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs sm:max-w-sm pointer-events-auto transition-all duration-300">
            {transcript && (
              <div className="text-blue-400 text-sm mb-2 font-medium">
                You: "{transcript}"
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                Thinking...
              </div>
            )}
            {aiResponse && !isProcessing && (
              <div className="text-white">
                <span className="font-bold text-pink-500 mr-2">AI:</span>
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* Orb Button */}
        <button
          onClick={toggleListening}
          className={`pointer-events-auto relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 group ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
              : isSpeaking
              ? 'bg-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)]'
              : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]'
          }`}
        >
          {/* Pulsing rings when active */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            </>
          )}

          {isListening ? (
            <Mic className="w-6 h-6 text-white animate-pulse" />
          ) : isSpeaking ? (
            <Play className="w-6 h-6 text-white fill-white animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6 text-white/80 group-hover:text-white" />
          )}
        </button>
      </div>
    </>
  );
};
