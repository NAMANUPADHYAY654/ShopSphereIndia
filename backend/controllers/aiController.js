const { GoogleGenAI } = require("@google/genai");

// @desc    Generate an SEO-optimized product listing from bullet points
// @route   POST /api/ai/generate-listing
// @access  Private/Seller
const generateListing = async (req, res) => {
  try {
    const { bulletPoints, category } = req.body;

    if (!bulletPoints || !Array.isArray(bulletPoints) || bulletPoints.length === 0) {
      return res.status(400).json({ error: "Please provide an array of bullet points." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Act as an expert e-commerce copywriter. I am providing you with basic bullet points for a product in the "${category || 'General'}" category. 
Bullet Points:
${bulletPoints.map(b => `- ${b}`).join('\n')}

Based on these points, write a highly converting, SEO-optimized Product Title (max 60 characters) and a detailed, persuasive Product Description (2-3 paragraphs) formatted in clean HTML (using <b>, <p>, <ul> tags). Also provide 5 relevant search tags.

Respond ONLY with a valid JSON object in the exact following format, with no markdown code block wrappers:
{
  "title": "Your Generated Title",
  "description": "Your generated HTML description",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);

  } catch (error) {
    console.error("AI Listing Gen Error:", error);
    res.status(500).json({ error: "Failed to generate listing." });
  }
};

// @desc    Summarize an array of reviews and determine overall sentiment
// @route   POST /api/ai/summarize-reviews
// @access  Public
const summarizeReviews = async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: "Please provide an array of review texts." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a product review analyst. Analyze the following customer reviews for a product:
${reviews.map((r, i) => `Review ${i+1}: "${r}"`).join('\n')}

Condense these reviews into a brief, easy-to-read summary. Identify the key Pros and Cons. Also provide an overall sentiment score (Positive, Neutral, or Negative).

Respond ONLY with a valid JSON object in the exact following format:
{
  "summary": "Overall summary of the reviews...",
  "pros": ["Pro 1", "Pro 2"],
  "cons": ["Con 1", "Con 2"],
  "sentiment": "Positive" // or Neutral or Negative
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);

  } catch (error) {
    console.error("AI Review Summarizer Error:", error);
    res.status(500).json({ error: "Failed to summarize reviews." });
  }
};

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// ... existing code ...

// @desc    Admin Text-to-SQL Copilot (Zero-Shot Data Analysis & Action Intent)
// @route   POST /api/ai/admin/copilot
// @access  Private/Admin
const adminCopilot = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Fetch aggregate data to simulate a DB context for the LLM
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}).select('name price stock category ratings numOfReviews').limit(20);
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI Admin Copilot for ShopSphere.
The admin asked: "${query}"

Database Context:
- Total Users: ${totalUsers}
- Total Products: ${totalProducts}
- Sample Products: ${JSON.stringify(products)}
- Recent GMV trend: Yesterday dropped 15% due to a payment gateway timeout in the evening.

Analyze the request. 
1. Is it a "query" (asking for data or root-cause, e.g., "why did GMV drop?") or an "action" (e.g., "suspend users with < 2 stars")?
2. If "query", answer it using the context.
3. If "action", define the action to be confirmed by the admin (e.g., "SUSPEND_USERS") and mock a list of affected records.

Respond ONLY with a valid JSON object in this exact format:
{
  "intent": "query" or "action",
  "answer": "A textual answer or root-cause explanation, OR a confirmation message for the action",
  "actionPayload": { "actionType": "SUSPEND_USERS", "recordsAffected": 5 } // Only include if intent is 'action'
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Copilot Error:", error);
    res.status(500).json({ error: "Failed to process query." });
  }
};

// @desc    AI Fraud & Anomaly Radar
// @route   GET /api/ai/admin/fraud-radar
// @access  Private/Admin
const fraudRadar = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI Fraud Detection system for ShopSphere. 
Generate a JSON array of 3 realistic, simulated anomalies or fraud alerts that an e-commerce admin should review today.
Examples of fraud: Account takeover, payment fraud, duplicate knockoff listings.

For each alert, provide a deep analysis explaining WHY it is flagged. Include a confidence score and specific evidence points.

Respond ONLY with a valid JSON array of objects in this exact format:
[
  { 
    "id": "1", 
    "severity": "High", 
    "type": "Payment Fraud", 
    "description": "Sudden spike in high-value orders from new account.", 
    "confidenceScore": 94,
    "evidence": ["Billing address in USA, IP location in Russia", "3 failed credit card attempts prior to success", "Cart value is 10x the store average"],
    "recommendedAction": "Block IP & Refund Transaction" 
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Fraud Radar Error:", error);
    res.status(500).json({ error: "Failed to generate fraud report." });
  }
};

// @desc    Auto Weekly Digest
// @route   GET /api/ai/admin/weekly-digest
// @access  Private/Admin
const weeklyDigest = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the Chief Data Officer for ShopSphere. Write an executive Weekly Digest email for the Admin.
Invent realistic weekly metrics (e.g., Revenue up 12%, 150 new users, top selling product was XYZ).
Format the response as clean HTML (using <h2>, <p>, <ul>, <strong>). 

Respond ONLY with a valid JSON object:
{ "htmlContent": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Weekly Digest Error:", error);
    res.status(500).json({ error: "Failed to generate digest." });
  }
};

// @desc    Seller Health & Churn Predictor
// @route   GET /api/ai/admin/seller-health
// @access  Private/Admin
const sellerHealth = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI assessing Seller Health for an e-commerce platform.
Generate a JSON array of 4 mock sellers with their health scores, churn probability, and a brief AI insight.

Respond ONLY with a valid JSON array of objects in this format:
[
  { 
    "sellerName": "TechHaven", 
    "healthScore": 95, 
    "churnProbability": "Low (5%)", 
    "issues": "None", 
    "aiInsight": "Top performing seller, consider offering premium placement." 
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Seller Health Error:", error);
    res.status(500).json({ error: "Failed to generate seller health." });
  }
};

// @desc    Execute Confirmed Admin Action
// @route   POST /api/ai/admin/execute-action
// @access  Private/Admin
const executeAdminAction = async (req, res) => {
  try {
    const { actionType } = req.body;
    // Mock the DB update for safety
    res.json({ message: `Successfully executed bulk action: ${actionType}` });
  } catch (error) {
    res.status(500).json({ error: "Action failed." });
  }
};

// @desc    Pricing Anomaly Detection
// @route   GET /api/ai/admin/pricing-radar
// @access  Private/Admin
const pricingRadar = async (req, res) => {
  try {
    const products = await Product.find({}).select('name price category').limit(10);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a Pricing Anomaly Detector. Analyze these products: ${JSON.stringify(products)}.
Identify 2 products that might be suspiciously low priced (scam bait) or price gouging.
Respond ONLY with a valid JSON array of objects:
[ { "productName": "...", "currentPrice": 0, "anomalyType": "Suspiciously Low", "reason": "..." } ]`;
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to detect pricing anomalies." });
  }
};

// @desc    Auto-Draft Rejection Reason
// @route   POST /api/ai/admin/draft-rejection
// @access  Private/Admin
const draftRejection = async (req, res) => {
  try {
    const { itemDetails, reason } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Draft a polite, professional rejection email to a seller explaining why their listing was rejected. 
Listing: ${itemDetails}
Admin's brief reason: ${reason}
Respond ONLY with a valid JSON object: { "emailSubject": "...", "emailBodyHtml": "..." }`;
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to draft rejection." });
  }
};

// @desc    Support Ticket Auto-Triage
// @route   GET /api/ai/admin/support-triage
// @access  Private/Admin
const supportTriage = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Mock 3 incoming support tickets. Auto-triage them by assigning a Category (Billing, Shipping, Tech), Urgency (High/Medium/Low), and a draft first-response.
Respond ONLY with a valid JSON array of objects:
[ { "id": "TKT-1", "subject": "...", "userMessage": "...", "category": "...", "urgency": "...", "draftResponse": "..." } ]`;
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to triage tickets." });
  }
};

// @desc    Sentiment Trend Radar
// @route   GET /api/ai/admin/sentiment-radar
// @access  Private/Admin
const sentimentRadar = async (req, res) => {
  try {
    res.json([
      { day: 'Mon', sentiment: 85 },
      { day: 'Tue', sentiment: 82 },
      { day: 'Wed', sentiment: 75 },
      { day: 'Thu', sentiment: 60 }, // Small drop
      { day: 'Fri', sentiment: 88 },
      { day: 'Sat', sentiment: 92 },
      { day: 'Sun', sentiment: 95 }
    ]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sentiment." });
  }
};

// @desc    Seller Onboarding Copilot
// @route   POST /api/ai/seller/onboard-chat
// @access  Public
const onboardingCopilot = async (req, res) => {
  try {
    const { message } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a helpful Seller Onboarding Assistant for ShopSphere.
A new seller says: "${message}"
Answer their question briefly and professionally. You help with KYC, bank details, and platform rules.
Respond ONLY with a valid JSON object: { "reply": "Your helpful response" }`;
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to generate copilot response." });
  }
};

// @desc    Auto-Categorize & Tag Product
// @route   POST /api/ai/seller/auto-categorize
// @access  Private/Seller
const autoCategorize = async (req, res) => {
  try {
    const { description } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze this product description: "${description}".
Determine the best category (Choose ONLY from: Electronics, Fashion, Deals).
Generate 5 relevant SEO tags.
Also, check for any mismatches or policy violations (e.g., selling weapons, or a description that contradicts the category).
Respond ONLY with a valid JSON object:
{ "category": "Electronics", "tags": ["tag1", "tag2"], "flags": "None", "title": "Optimized Title" }`;
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to categorize product." });
  }
};

module.exports = {
  generateListing,
  summarizeReviews,
  adminCopilot,
  executeAdminAction,
  fraudRadar,
  weeklyDigest,
  sellerHealth,
  pricingRadar,
  draftRejection,
  supportTriage,
  sentimentRadar,
  onboardingCopilot,
  autoCategorize
};
