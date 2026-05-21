import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
} else {
  console.log(
    "Gemini API key not configured or placeholder detected. Using intelligent local analysis fallback.",
  );
}

// Define Structured JSON Output Schema
const responseSchema = {
  type: "object",
  properties: {
    mood_score: {
      type: "integer",
      description:
        "Mood score between 1 and 100, where 1 is extremely down/sad/angry and 100 is ecstatic/highly energetic and happy.",
    },
    dominant_emotion: {
      type: "string",
      description:
        "The primary emotion shown in the text (e.g., Happy, Anxious, Proud, Grateful, Tired, Angry, Melancholy, Neutral).",
    },
    feelings_list: {
      type: "array",
      items: { type: "string" },
      description:
        "A list of secondary emotions, feelings, or sensations expressed in the entry.",
    },
    summary: {
      type: "string",
      description:
        "A short, empathetic 1-2 sentence summary of what the user wrote.",
    },
    celebration: {
      type: "string",
      description:
        "A positive, encouraging message acknowledging their small wins, efforts, honesty, or healthy mindset.",
    },
    improvement: {
      type: "string",
      description:
        "An actionable, empathetic suggestion or open-ended question to help them process challenging thoughts, improve their mood, or maintain momentum.",
    },
  },
  required: [
    "mood_score",
    "dominant_emotion",
    "feelings_list",
    "summary",
    "celebration",
    "improvement",
  ],
};

// Fallback intelligent local analysis function
export function getMockInsight(content) {
  const text = content.toLowerCase();

  let mood_score = 55;
  let dominant_emotion = "Thoughtful";
  let feelings_list = ["reflective"];
  let celebration =
    "Thank you for taking the time to journal today. Acknowledging your feelings is a beautiful form of self-care!";
  let improvement =
    "Try identifying one tiny thing that brought you peace or a sense of accomplishment today, no matter how small.";
  let summary = "A reflective moment captured in your journal.";

  if (
    text.includes("happy") ||
    text.includes("excited") ||
    text.includes("great") ||
    text.includes("good") ||
    text.includes("joy") ||
    text.includes("won") ||
    text.includes("love") ||
    text.includes("proud") ||
    text.includes("accomplish")
  ) {
    mood_score = 85;
    dominant_emotion = "Joyful";
    feelings_list = ["happy", "optimistic", "accomplished"];
    celebration =
      "That sounds like a wonderful experience! Celebrate these positive moments and the joy they bring you.";
    improvement =
      "Keep this positive energy going by sharing a smile or reflecting on what specifically made this so great.";
  } else if (
    text.includes("sad") ||
    text.includes("down") ||
    text.includes("cry") ||
    text.includes("lonely") ||
    text.includes("depressed") ||
    text.includes("hurt") ||
    text.includes("grief")
  ) {
    mood_score = 25;
    dominant_emotion = "Melancholy";
    feelings_list = ["sad", "lonely", "reflective"];
    celebration =
      "It takes strength to express and face these difficult feelings. You did a great job putting your emotions into words today.";
    improvement =
      "Be gentle with yourself. Maybe take a small break, drink a glass of water, or talk to someone you trust.";
  } else if (
    text.includes("angry") ||
    text.includes("mad") ||
    text.includes("frustrated") ||
    text.includes("hate") ||
    text.includes("annoyed") ||
    text.includes("pissed")
  ) {
    mood_score = 35;
    dominant_emotion = "Frustrated";
    feelings_list = ["angry", "overwhelmed", "irritated"];
    celebration =
      "Venting is a healthy way to release tension. Recognizing your frustration is a powerful first step to cooling down.";
    improvement =
      "Try taking a few deep, slow breaths. When you feel ready, ask yourself what boundary was crossed and how you can address it calmly.";
  } else if (
    text.includes("anxious") ||
    text.includes("worry") ||
    text.includes("nervous") ||
    text.includes("scared") ||
    text.includes("stress") ||
    text.includes("afraid") ||
    text.includes("panic")
  ) {
    mood_score = 30;
    dominant_emotion = "Anxious";
    feelings_list = ["nervous", "stressed", "apprehensive"];
    celebration =
      "Acknowledge your courage for showing up and writing down what is worrying you. Bringing fears to light reduces their power.";
    improvement =
      "Focus on the present moment. Try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
  } else if (
    text.includes("tired") ||
    text.includes("exhausted") ||
    text.includes("sleepy") ||
    text.includes("burnout") ||
    text.includes("drain")
  ) {
    mood_score = 40;
    dominant_emotion = "Exhausted";
    feelings_list = ["tired", "drained", "weary"];
    celebration =
      "You showed up to write even though your energy is low. That is amazing dedication to your well-being!";
    improvement =
      "Prioritize rest and self-care. Allow yourself to unplug and charge your batteries without feeling guilty.";
  } else if (
    text.includes("grateful") ||
    text.includes("thankful") ||
    text.includes("blessed") ||
    text.includes("appreciate")
  ) {
    mood_score = 90;
    dominant_emotion = "Grateful";
    feelings_list = ["thankful", "peaceful", "content"];
    celebration =
      "Gratitude has a beautiful way of centering the heart. It is fantastic that you are focusing on the good things!";
    improvement =
      "Can you think of a way to pass this gratitude forward, perhaps by sending a quick thank you message to a friend?";
  }

  // Create a customized summary from the first sentence or two
  const cleanText = content.trim();
  const sentences = cleanText.split(/[.!?]+/);
  if (sentences.length > 0 && sentences[0].length > 5) {
    summary = sentences[0].substring(0, 150) + ".";
  }

  return {
    mood_score,
    dominant_emotion,
    feelings_list,
    summary,
    celebration,
    improvement,
  };
}

/**
 * Analyzes journal entry content using Google Gemini API with fallback support.
 * @param {string} content The journal entry text.
 * @returns {Promise<object>} The insights object matching responseSchema.
 */
export async function analyzeJournalEntry(content) {
  if (!content || content.trim().length === 0) {
    throw new Error("Content is empty");
  }

  if (!genAI) {
    console.log(
      "Gemini client not initialized. Falling back to local analysis.",
    );
    return getMockInsight(content);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-31b-it",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const prompt = `Analyze this journal entry and extract emotional insights. Maintain an empathetic, gamified journal vibe. Entry:\n"${content}"`;

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    console.log("Gemini API response received.");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error(
      "Gemini API analysis failed. Falling back to intelligent local analysis. Error:",
      error,
    );
    return getMockInsight(content);
  }
}
