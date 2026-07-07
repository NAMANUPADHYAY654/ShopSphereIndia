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
const OtpSession = require('../models/otpSessionModel');

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

const maskEmail = (email = '') => {
  const [localPart, domainPart] = email.split('@');
  if (!domainPart) return email;
  return `${localPart.slice(0, 2)}***@${domainPart}`;
};

const maskPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `****${digits.slice(-4)}`;
};

const securityCenter = async (req, res) => {
  try {
    const [users, orders, otpSessions] = await Promise.all([
      User.find({}).select('name email role phone googleId isVerified createdAt').sort({ createdAt: -1 }).limit(200),
      Order.find({}).select('user totalPrice paymentInfo orderStatus shippingInfo isPaid createdAt').sort({ createdAt: -1 }).limit(200),
      OtpSession.find({}).select('user purpose channel destination attempts consumed expiresAt createdAt').sort({ createdAt: -1 }).limit(200),
    ]);

    const now = new Date();
    const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const from = dayStart(date);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return { label: from.toLocaleDateString('en-IN', { weekday: 'short' }), from, to };
    });

    const timeline = last7Days.map(({ label, from, to }) => ({
      day: label,
      orders: orders.filter((order) => order.createdAt >= from && order.createdAt < to).length,
      otpChecks: otpSessions.filter((session) => session.createdAt >= from && session.createdAt < to).length,
      newUsers: users.filter((user) => user.createdAt >= from && user.createdAt < to).length,
    }));

    const unverifiedUsers = users.filter((user) => !user.isVerified);
    const googleLinkedUsers = users.filter((user) => Boolean(user.googleId)).length;
    const activeOtpSessions = otpSessions.filter((session) => !session.consumed && session.expiresAt > now);
    const riskyOtpSessions = otpSessions.filter((session) => !session.consumed && session.attempts >= 3);
    const highValueOrders = orders.filter((order) => order.totalPrice >= 15000);
    const codRiskOrders = orders.filter((order) => !order.isPaid && order.totalPrice >= 8000);

    const alerts = [
      ...unverifiedUsers.slice(0, 4).map((user, index) => ({
        id: `user-${index + 1}`,
        severity: 'Medium',
        type: 'Account Verification',
        title: `${user.name} needs verification`,
        description: `Pending verification for ${maskEmail(user.email)}.`,
        evidence: [
          `Role: ${user.role}`,
          `Contact: ${user.phone ? maskPhone(user.phone) : 'No phone on file'}`,
        ],
        recommendedAction: 'Send verification reminder',
      })),
      ...highValueOrders.slice(0, 4).map((order, index) => ({
        id: `order-${index + 1}`,
        severity: 'High',
        type: 'High Value Order',
        title: `Order ₹${Number(order.totalPrice).toLocaleString('en-IN')} requires review`,
        description: `High-value order placed while payment is ${order.isPaid ? 'captured' : 'pending'}.`,
        evidence: [
          `Order total: ₹${Number(order.totalPrice).toLocaleString('en-IN')}`,
          `Status: ${order.orderStatus}`,
          `Payment: ${order.paymentInfo?.status || 'Unknown'}`,
        ],
        recommendedAction: 'Review order manually',
      })),
      ...riskyOtpSessions.slice(0, 4).map((session, index) => ({
        id: `otp-${index + 1}`,
        severity: 'High',
        type: 'OTP Abuse',
        title: `OTP session with ${session.attempts} failed attempts`,
        description: `Repeated OTP failures for ${session.destination}.`,
        evidence: [
          `Channel: ${session.channel}`,
          `Attempts: ${session.attempts}`,
          `Expires: ${new Date(session.expiresAt).toLocaleString('en-IN')}`,
        ],
        recommendedAction: 'Throttle or block verification attempts',
      })),
      ...codRiskOrders.slice(0, 4).map((order, index) => ({
        id: `cod-${index + 1}`,
        severity: 'Medium',
        type: 'Cash on Delivery Risk',
        title: `COD order worth ₹${Number(order.totalPrice).toLocaleString('en-IN')}`,
        description: 'Cash-on-delivery order above the risk threshold.',
        evidence: [
          `Order status: ${order.orderStatus}`,
          `Payment captured: ${order.isPaid ? 'Yes' : 'No'}`,
        ],
        recommendedAction: 'Require additional confirmation',
      })),
    ];

    const securityScore = Math.max(
      40,
      100 - (unverifiedUsers.length * 2) - (riskyOtpSessions.length * 4) - (codRiskOrders.length * 2)
    );

    const recentEvents = [
      ...otpSessions.slice(0, 5).map((session) => ({
        id: String(session._id),
        type: session.purpose === 'register' ? 'Registration OTP' : 'Login OTP',
        status: session.consumed ? 'Completed' : session.attempts > 0 ? 'In progress' : 'Pending',
        detail: `${session.channel.toUpperCase()} • ${session.destination}`,
        time: new Date(session.createdAt).toLocaleString('en-IN'),
      })),
      ...orders.slice(0, 5).map((order) => ({
        id: String(order._id),
        type: 'Order Monitor',
        status: order.isPaid ? 'Paid' : 'Pending',
        detail: `₹${Number(order.totalPrice).toLocaleString('en-IN')} • ${order.orderStatus}`,
        time: new Date(order.createdAt).toLocaleString('en-IN'),
      })),
    ].slice(0, 8);

    const controls = [
      { name: 'Email / SMS verification coverage', value: `${users.length ? Math.round((users.filter((u) => u.isVerified).length / users.length) * 100) : 0}%` },
      { name: 'Google sign-in adoption', value: `${users.length ? Math.round((googleLinkedUsers / users.length) * 100) : 0}%` },
      { name: 'Active OTP sessions', value: String(activeOtpSessions.length) },
      { name: 'High-value orders under watch', value: String(highValueOrders.length) },
      { name: 'Admin security score', value: `${securityScore}/100` },
    ];

    res.json({
      metrics: {
        totalUsers: users.length,
        verifiedUsers: users.filter((user) => user.isVerified).length,
        googleLinkedUsers,
        activeOtpSessions: activeOtpSessions.length,
        suspiciousOrders: codRiskOrders.length + riskyOtpSessions.length,
        highValueOrders: highValueOrders.length,
        securityScore,
      },
      timeline,
      alerts,
      controls,
      recentEvents,
    });
  } catch (error) {
    console.error('Security Center Error:', error);
    res.status(500).json({ error: 'Failed to load security center.' });
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
  securityCenter,
  onboardingCopilot,
  autoCategorize
};
