const Product = require("../models/productModel");
const Chat = require("../models/chatModel");

// ──────────────────────────────────────────────────────────────────
// Multi-Provider AI Chatbot — Hugging Face → Grok → OpenAI → Gemini
// Falls through providers until one responds successfully.
// ──────────────────────────────────────────────────────────────────

/**
 * Build the system prompt with product context
 */
const buildSystemPrompt = (productsContext) => {
  return `You are ShopBot, an intelligent and friendly customer support AI for "ShopSphere India", a premium Indian e-commerce store.

RULES:
1. ONLY answer questions related to shopping, products, orders, returns, delivery, and store policies.
2. If the user asks unrelated questions, politely decline and steer them back to shopping.
3. Keep responses concise (under 150 words), helpful, and professional.
4. Use ₹ for prices. Be enthusiastic about products.
5. If you don't know an answer, offer to connect the user with a human agent.

AVAILABLE PRODUCTS:
${productsContext}`;
};

/**
 * Build chat messages array (OpenAI-compatible format used by Grok & OpenAI)
 */
const buildMessages = (systemPrompt, userMessage, history = []) => {
  const messages = [{ role: "system", content: systemPrompt }];

  // Add conversation history if available
  if (history && history.length > 0) {
    const recentHistory = history.slice(-6); // Last 3 exchanges
    recentHistory.forEach((msg) => {
      messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content });
    });
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
};

// ──────────────────────────────────────────────────────────────────
// Provider 1: Hugging Face Inference API (generous free tier)
// ──────────────────────────────────────────────────────────────────
const callHuggingFace = async (systemPrompt, userMessage, history) => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error("HF_API_KEY not configured");

  const prompt = `<|system|>\n${systemPrompt}\n<|end|>\n<|user|>\n${userMessage}\n<|end|>\n<|assistant|>\n`;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`HuggingFace API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.trim();
  }
  throw new Error("Unexpected HuggingFace response format");
};

// ──────────────────────────────────────────────────────────────────
// Provider 2: Groq (ultra-fast LPU inference, generous free tier)
// ──────────────────────────────────────────────────────────────────
const callGroq = async (systemPrompt, userMessage, history) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const messages = buildMessages(systemPrompt, userMessage, history);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
};

// ──────────────────────────────────────────────────────────────────
// Provider 3: OpenAI
// ──────────────────────────────────────────────────────────────────
const callOpenAI = async (systemPrompt, userMessage, history) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const messages = buildMessages(systemPrompt, userMessage, history);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
};

// ──────────────────────────────────────────────────────────────────
// Provider 4: Gemini (Google) — Last resort fallback
// ──────────────────────────────────────────────────────────────────
const callGemini = async (systemPrompt, userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const { GoogleGenAI } = require("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\nUser: ${userMessage}`,
  });

  return response.text || "";
};

// ──────────────────────────────────────────────────────────────────
// Fallback Chain — Groq first (we have a key), then others
// ──────────────────────────────────────────────────────────────────
const providers = [
  { name: "Groq",        fn: callGroq },
  { name: "HuggingFace", fn: callHuggingFace },
  { name: "OpenAI",      fn: callOpenAI },
  { name: "Gemini",      fn: callGemini },
];

const callWithFallback = async (systemPrompt, userMessage, history) => {
  const errors = [];

  for (const provider of providers) {
    try {
      console.log(`🤖 Trying ${provider.name}...`);
      const reply = await provider.fn(systemPrompt, userMessage, history);
      if (reply && reply.length > 0) {
        console.log(`✅ ${provider.name} responded successfully`);
        return { reply, provider: provider.name };
      }
    } catch (err) {
      console.warn(`⚠️  ${provider.name} failed: ${err.message}`);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
};

// ──────────────────────────────────────────────────────────────────
// Main Controller
// ──────────────────────────────────────────────────────────────────
const generateChatResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch products for context
    const products = await Product.find({}).limit(15).select("name price description stock");
    const productsContext = products
      .map((p) => `- ${p.name}: ₹${p.price}. ${p.description || "No description"} (Stock: ${p.stock})`)
      .join("\n");

    const systemPrompt = buildSystemPrompt(productsContext);

    // Call AI with automatic fallback
    const { reply, provider } = await callWithFallback(systemPrompt, message, history);

    // Save to DB (only if user is authenticated)
    if (req.user && req.user._id) {
      try {
        let chatSession = await Chat.findOne({ user: req.user._id });
        if (!chatSession) {
          chatSession = new Chat({ user: req.user._id, messages: [] });
        }
        chatSession.messages.push({ role: "user", content: message });
        chatSession.messages.push({ role: "assistant", content: reply });
        await chatSession.save();
      } catch (dbErr) {
        console.warn("Chat save failed (non-critical):", dbErr.message);
      }
    }

    res.json({ reply, provider });
  } catch (error) {
    console.error("Chatbot Error:", error.message);
    res.status(500).json({
      error: "All AI services are currently unavailable. Please try again in a moment.",
    });
  }
};

module.exports = { generateChatResponse };
