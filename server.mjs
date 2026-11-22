import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const port = Number(process.env.PORT || 3000);

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. Add it to the .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model });
});

app.post("/api/chat", async (req, res) => {
  try {
    const incoming = req.body?.messages;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ error: "কোনো মেসেজ পাওয়া যায়নি।" });
    }

    // Keep only the latest 20 messages and accept only plain user/model text.
    const messages = incoming.slice(-20).map((item) => {
      const role = item?.role === "model" ? "model" : "user";
      const text = String(item?.text || "").trim().slice(0, 8000);
      return { role, parts: [{ text }] };
    }).filter((item) => item.parts[0].text.length > 0);

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return res.status(400).json({ error: "শেষ মেসেজটি user message হতে হবে।" });
    }

    const result = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        temperature: 0.7,
        systemInstruction:
          "You are J.A.R.V.I.S., a helpful, respectful personal AI assistant. " +
          "Reply in the same language as the user's latest message. " +
          "For Bengali, use natural and clear Bengali. Be concise but useful. " +
          "Never claim you performed an action unless it actually happened. " +
          "If you are unsure, say so honestly."
      }
    });

    const reply = result.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: "AI থেকে খালি উত্তর এসেছে। আবার চেষ্টা করুন।" });
    }

    res.json({ reply, model });
  } catch (error) {
    const message = String(error?.message || error);
    console.error("Gemini API error:", message);

    if (/503|UNAVAILABLE|high demand|overloaded/i.test(message)) {
      return res.status(503).json({
        error: "Gemini সার্ভার এখন ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
      });
    }
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(message)) {
      return res.status(429).json({
        error: "Gemini Free Tier-এর অনুরোধসীমা আপাতত পূর্ণ হয়েছে। পরে আবার চেষ্টা করুন।"
      });
    }
    if (/404|NOT_FOUND|model/i.test(message)) {
      return res.status(502).json({
        error: `মডেল "${model}" পাওয়া যাচ্ছে না। .env ফাইলে GEMINI_MODEL-এর সঠিক model ID বসাতে হবে।`
      });
    }
    if (/401|403|API_KEY|PERMISSION_DENIED/i.test(message)) {
      return res.status(502).json({
        error: "API Key বা প্রজেক্টের অনুমতিতে সমস্যা হয়েছে। .env ফাইলের key নিজে যাচাই করুন; কাউকে পাঠাবেন না।"
      });
    }
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। Termux-এর error log দেখুন।" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS is running: http://127.0.0.1:${port}`);
  console.log(`Model: ${model}`);
});
