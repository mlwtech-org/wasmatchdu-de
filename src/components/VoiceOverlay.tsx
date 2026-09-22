import React, { useEffect, useState, useRef } from "react";
import { Mic, X, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface VoiceOverlayProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  onClose,
  onSearch,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check for browser support
    const win = window as unknown as {
      SpeechRecognition: unknown;
      webkitSpeechRecognition: unknown;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (win.SpeechRecognition ||
      win.webkitSpeechRecognition) as new () => any;

    if (!SpeechRecognition) {
      setError("Your browser doesn't support voice search.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Auto-submit after 1.5s of silence
      timeoutRef.current = setTimeout(() => {
        if (currentTranscript.trim()) {
          onSearch(currentTranscript.trim());
          onClose();
        }
      }, 1500);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setError(
          "Microphone access denied. Please allow microphone permissions.",
        );
      } else if (event.error !== "no-speech") {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Start listening automatically when mounted
    try {
      recognition.start();
    } catch (err) {
      console.error(err);
    }

    return () => {
      recognition.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onClose, onSearch]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (transcript.trim()) {
        onSearch(transcript.trim());
        onClose();
      }
    } else {
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        {/* Animated Orb / Mic Button */}
        <div className="relative mb-12">
          {isListening && (
            <>
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse opacity-30 scale-125"></div>
            </>
          )}

          <button
            onClick={toggleListening}
            className={cn(
              "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
              isListening
                ? "bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-[0_0_40px_rgba(56,189,248,0.5)]"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700",
            )}
          >
            <Mic
              className={cn(
                "w-10 h-10 transition-transform duration-300",
                isListening && "scale-110",
              )}
            />
          </button>
        </div>

        {/* Status Text */}
        <div className="min-h-[80px] flex items-center justify-center">
          {error ? (
            <p className="text-red-400 text-lg font-medium">{error}</p>
          ) : !isListening && !transcript ? (
            <p className="text-slate-400 text-xl font-medium flex items-center gap-2">
              Microphone is off
            </p>
          ) : transcript ? (
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              "{transcript}"
            </h2>
          ) : (
            <p className="text-cyan-400 text-2xl font-bold tracking-widest uppercase animate-pulse flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Listening...
            </p>
          )}
        </div>

        <p className="text-slate-500 mt-8 text-sm">
          Speak to search for channels, categories, or events.
        </p>
      </div>
    </div>
  );
};
