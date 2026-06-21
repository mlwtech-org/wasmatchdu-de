import { useState, useEffect, useRef } from "react";

// Helper to call free Google Translate API
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  if (!text || !text.trim()) return "";

  // If source and target are the same (or target is 'auto' and source matches browser), just return text
  // Actually, let's always translate if targetLang is different from sourceLang
  if (sourceLang === targetLang) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // data[0] is an array of translated segments
    let translated = "";
    if (data && data[0]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data[0].forEach((segment: any) => {
        if (segment[0]) translated += segment[0];
      });
    }
    return translated || text;
  } catch (err) {
    console.error("Translation API error:", err);
    return text; // fallback to original transcript
  }
}

export function useLiveTranslation(
  enabled: boolean,
  sourceLang: string = "de-DE",
  targetLang: string = "en",
) {
  const [translatedText, setTranslatedText] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // We need to keep track of the latest transcript so we don't translate every single keystroke of interim results
  const translationTimeoutRef = useRef<number | null>(null);
  const lastTranslatedSourceRef = useRef<string>("");

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

    recognition.continuous = true;
    recognition.interimResults = true;

    // Use the selected source language for speech recognition
    recognition.lang = sourceLang;

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

      const currentText = finalTranscript || interimTranscript;

      // If we are not actually translating (source == target), just show it
      if (sourceLang.split("-")[0] === targetLang.split("-")[0]) {
        setTranslatedText(currentText);
        return;
      }

      // Debounce translation API calls for interim results
      if (translationTimeoutRef.current) {
        window.clearTimeout(translationTimeoutRef.current);
      }

      // If it's a final result, translate immediately
      if (finalTranscript) {
        translateText(
          finalTranscript,
          sourceLang.split("-")[0],
          targetLang.split("-")[0],
        ).then((res) => {
          setTranslatedText(res);
          lastTranslatedSourceRef.current = finalTranscript;
        });
      } else {
        // Show something while translating
        // We can optionally show the original text faintly, or just wait.
        // Let's debounce the interim translation by 1 second
        translationTimeoutRef.current = window.setTimeout(() => {
          if (currentText !== lastTranslatedSourceRef.current) {
            translateText(
              currentText,
              sourceLang.split("-")[0],
              targetLang.split("-")[0],
            ).then((res) => {
              setTranslatedText(res);
              lastTranslatedSourceRef.current = currentText;
            });
          }
        }, 1000);
      }
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
      if (translationTimeoutRef.current)
        window.clearTimeout(translationTimeoutRef.current);
      recognition.stop();
    };
  }, [enabled, sourceLang, targetLang]);

  return translatedText;
}
