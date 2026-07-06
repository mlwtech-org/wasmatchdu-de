import React, { useEffect, useRef, useState } from "react";
import { Mic, Bot, Key, X, Loader2, Play } from "lucide-react";
import { useAIAssistantStore } from "../store/useAIAssistantStore";
import { usePlayerStore } from "../store/usePlayerStore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from "react-router-dom";

// SpeechRecognition Types
const SpeechRecognition =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const AIAssistantOrb: React.FC = () => {
  const navigate = useNavigate();
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
    clearInteraction,
  } = useAIAssistantStore();

  const {
    channels,
    setCurrentChannel,
    setSelectedGroup,
    setAiRecommendedChannels,
    setAiRecommendationTitle,
  } = usePlayerStore();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
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
        console.error("Speech recognition error", event.error);
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

  const toggleDiscovery = () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsDiscoveryOpen(!isDiscoveryOpen);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) =>
        v.lang.startsWith("en-") &&
        (v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Natural")),
    );
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

      const channelNames = channels
        .map((c) => `${c.name} (${c.group})`)
        .join(", ");
      const systemPrompt = `You are a Smart TV AI Assistant. The user said: "${command}".
      Available channels: ${channelNames.substring(0, 500)}... (truncated if long).
      
      Determine the user's intent and respond with a JSON object exactly like this:
      
      If they want to play a specific channel (Option 1):
      {"type": "PLAY_DIRECT", "channel_name": "Exact Name from list", "response": "Playing XYZ..."}
      
      If they are asking for a genre, mood, or vague recommendation (Option 3):
      {"type": "SUGGEST_MOOD", "keywords": ["keyword1", "keyword2"], "title": "AI Picks for 'Mood'", "response": "I've updated your dashboard with some great options."}
      
      If they are just chatting or making a general statement:
      {"type": "CHAT", "response": "I recommend checking out the Sports channels!"}
      
      Always return raw valid JSON only. No markdown formatting.`;

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();

      // Extract just the JSON object from the response using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "Failed to extract JSON from AI response: " + responseText,
        );
      }

      const parsed = JSON.parse(jsonMatch[0]);

      setAiResponse(parsed.response);
      speakText(parsed.response);

      if (parsed.type === "PLAY_DIRECT" && parsed.channel_name) {
        const targetChannel = channels.find((c) =>
          c.name.toLowerCase().includes(parsed.channel_name.toLowerCase()),
        );
        if (targetChannel) {
          setCurrentChannel(targetChannel);
          if (targetChannel.group) setSelectedGroup(targetChannel.group);
          navigate(`/live/${targetChannel.id}`);
        }
      } else if (parsed.type === "SUGGEST_MOOD" && parsed.keywords) {
        const keywords = parsed.keywords.map((k: string) => k.toLowerCase());
        const suggestedChannels = channels
          .filter((c) =>
            keywords.some(
              (k: string) =>
                c.name.toLowerCase().includes(k) ||
                c.group.toLowerCase().includes(k) ||
                (c.gemeinwohlCategory &&
                  c.gemeinwohlCategory.toLowerCase().includes(k)),
            ),
          )
          .slice(0, 15);

        if (suggestedChannels.length > 0) {
          setAiRecommendationTitle(parsed.title || "AI Recommendations");
          setAiRecommendedChannels(suggestedChannels);
          navigate("/dashboard");
        } else {
          setAiResponse(
            "I couldn't find any exact matches, but check out the dashboard!",
          );
          speakText(
            "I couldn't find any exact matches, but check out the dashboard!",
          );
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
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              To use the free voice assistant, please provide a Gemini API Key.
              You can get one for free from Google AI Studio.
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

      {/* Floating Orb Container */}
      <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none">
        {/* Discovery Overlay / Chat UI */}
        {isDiscoveryOpen && (
          <div className="bg-slate-900/95 border border-slate-700 p-5 rounded-3xl shadow-2xl backdrop-blur-xl w-[90vw] sm:w-[400px] pointer-events-auto transition-all duration-300 transform origin-bottom animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                AI Assistant
              </h3>
              <button
                onClick={() => setIsDiscoveryOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Flow */}
            <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Initial Greeting & Suggestions */}
              {!transcript && !aiResponse && !isProcessing && (
                <div className="flex flex-col gap-3">
                  <div className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-2xl rounded-tl-sm w-[90%] border border-slate-700/50">
                    Hi! How can I help you today? Here are a few things you can
                    ask me:
                  </div>
                  <div className="flex flex-col gap-2 pl-2">
                    {[
                      { icon: "📺", text: "Play Live News" },
                      { icon: "⚽", text: "Show me Live Sports" },
                      { icon: "🌍", text: "Take me to Earth Cams" },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTranscript(card.text);
                          handleVoiceCommand(card.text);
                        }}
                        className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-left p-3 rounded-xl transition-all border border-slate-700/50 hover:border-blue-500/50 group"
                      >
                        <span className="text-xl">{card.icon}</span>
                        <span className="text-slate-200 text-sm font-medium group-hover:text-white">
                          {card.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* User Message */}
              {transcript && (
                <div className="self-end bg-blue-600 text-white text-sm p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg">
                  {transcript}
                </div>
              )}

              {/* Processing State */}
              {isProcessing && (
                <div className="self-start text-slate-300 text-sm bg-slate-800/50 p-3 rounded-2xl rounded-tl-sm w-[85%] flex items-center gap-2 border border-slate-700/50">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  Thinking...
                </div>
              )}

              {/* AI Response */}
              {aiResponse && !isProcessing && (
                <div className="self-start text-slate-200 text-sm bg-slate-800/50 p-3 rounded-2xl rounded-tl-sm max-w-[90%] leading-relaxed border border-slate-700/50 shadow-md">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-full p-1 pl-4 shadow-inner">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    setTranscript(inputText.trim());
                    handleVoiceCommand(inputText.trim());
                    setInputText("");
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
              />
              <button
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                title="Use voice"
              >
                {isListening ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              {inputText.trim() && (
                <button
                  onClick={() => {
                    setTranscript(inputText.trim());
                    handleVoiceCommand(inputText.trim());
                    setInputText("");
                  }}
                  className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-all mr-1"
                  title="Send"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orb Button (Hidden when Discovery is open) */}
        {!isDiscoveryOpen && (
          <button
            onClick={toggleDiscovery}
            className={`pointer-events-auto relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 group ${
              isListening
                ? "bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                : isSpeaking
                  ? "bg-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)]"
                  : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
            }`}
          >
            {/* Pulsing rings when active */}
            {(isListening || isSpeaking) && (
              <>
                <div
                  className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
                  style={{ animationDuration: "1.5s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"
                  style={{ animationDuration: "2s", animationDelay: "0.5s" }}
                />
              </>
            )}

            {isListening ? (
              <Mic className="w-6 h-6 text-white animate-pulse" />
            ) : isSpeaking ? (
              <Play className="w-6 h-6 text-white fill-white animate-pulse" />
            ) : (
              <div title="AI Assistant">
                <Bot className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
              </div>
            )}
          </button>
        )}
      </div>
    </>
  );
};
