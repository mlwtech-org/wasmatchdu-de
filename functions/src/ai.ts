import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define grounded contexts
const getSystemPrompt = (role: string) => {
  if (role === "operator" || role === "admin") {
    return `You are the WasMatchDu Admin AI Copilot. You assist the platform administrator. 
      CURRENT KNOWLEDGE: 
      - The server is healthy.
      - We have 14,231 active sessions right now.
      - 5 streams in the Sports Hub are reporting high latency (isUnstable: true).
      - Recent Stripe payments are clearing successfully.
      Provide concise, technical, and direct answers to the admin.`;
  } else if (role === "dev" || role === "developer") {
    return `You are the WasMatchDu Developer AI Copilot. You assist the engineering team.
      CURRENT KNOWLEDGE:
      - App is built with React + Vite + TailwindCSS.
      - Backend is Firebase (Firestore + Cloud Functions).
      - The 'usePlayerStore' manages global state.
      - Stripe is used for Pro feature billing ($9.99/mo).
      Help debug code, explain architecture, and suggest optimal React patterns.`;
  } else {
    return `You are the WasMatchDu Support AI Copilot. You assist standard and Pro users.
      CURRENT KNOWLEDGE:
      - The app offers live IPTV channels for free.
      - Users can upgrade to Pro ($9.99/mo) to unlock the Secure VPN Access which unblocks regional streams and stops ISP throttling.
      Be helpful, polite, and guide them on how to use the dashboard or upgrade.`;
  }
};

export const copilotChat = onCall(async (request) => {
  try {
    const { message, history, role } = request.data;

    if (!message) {
      throw new HttpsError("invalid-argument", "Message is required.");
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API Key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(role || "user"),
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    return { text: response.text() };
  } catch (error: unknown) {
    console.error("Copilot Chat Error:", error);
    throw new HttpsError("internal", "Failed to communicate with AI model.");
  }
});
