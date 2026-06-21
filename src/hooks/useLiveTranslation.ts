import { useState, useEffect, useRef } from "react";

export function useLiveTranslation(enabled: boolean) {
  const [translatedText, setTranslatedText] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setTranslatedText("");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTranslatedText(
        "Live Translation is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // We want continuous listening
    recognition.continuous = true;
    recognition.interimResults = true;

    // Set to the target language we want to detect (or let it auto-detect if possible, but SpeechRecognition usually needs a lang)
    // For translation, ideally we would capture the audio, but Speech API only transcripts.
    // NOTE: True AI translation from audio directly requires a backend.
    // The Web Speech API provides Transcription in the user's language.
    // To translate, we'd need another API. But as a simple "Best in Class" client-side proxy,
    // we can provide Live Captions (Transcription) first.
    // We will set it to English transcription for now, or match the browser language.
    recognition.lang = navigator.language || "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setTranslatedText(finalTranscript || interimTranscript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        setTranslatedText(
          "Microphone/Audio access denied. Cannot generate live captions.",
        );
      }
    };

    recognition.onend = () => {
      // Restart if still enabled
      if (enabled) {
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      }
    };

    try {
      recognition.start();
      setTranslatedText("Listening for live audio...");
    } catch (e) {
      console.error(e);
    }

    return () => {
      recognition.stop();
    };
  }, [enabled]);

  return translatedText;
}
