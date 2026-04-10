const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const pdf = require('pdf-parse');

// --- Configuration ---
const genAI = new GoogleGenerativeAI(process.env.AIzaSyBoQzFltt96CcfIUcYkZqDgCN7sxHwU6rY);
const upload = multer({ storage: multer.memoryStorage() }); // RAM mein temporary storage

// Helper function to extract JSON from AI text
const cleanJSON = (text) => {
    try {
        const regex = /\{[\s\S]*\}/; 
        const match = text.match(regex);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        return null;
    }
};

// --- 1. ROADMAP GENERATOR ---
router.post('/generate-roadmap', async (req, res) => {
    try {
        const { careerGoal, skills } = req.body;
        if (!careerGoal) return res.status(400).json({ success: false, message: "Goal is required" });

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are an elite Career Architect. Provide structured roadmaps."
        });

        const prompt = `Generate a 5-step career roadmap for: ${careerGoal}. 
        Current skills: ${skills || 'Beginner'}. 
        Return ONLY a JSON object: { "title": "Path to ${careerGoal}", "steps": [{"phase": "Step Name", "description": "Details"}], "tip": "One Pro Tip" }`;

        const result = await model.generateContent(prompt);
        const data = cleanJSON(result.response.text());

        if (!data) throw new Error("Invalid AI Response");
        res.json({ success: true, roadmap: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI is brainstorming, try again!" });
    }
});

// --- 2. AI CAREER CHAT (CareerMitra Persona) ---
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "Your name is CareerMitra AI. You are a supportive, witty, and expert career mentor. Keep answers under 3 lines."
        });

        const result = await model.generateContent(prompt);
        res.json({ success: true, response: result.response.text() });
    } catch (error) {
        res.status(500).json({ success: false, response: "Connection lost! Check API key." });
    }
});

// --- 3. RESUME SCORER (PDF Upload + AI Analysis) ---
router.post('/resume-upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload a PDF file." });

        // 1. PDF se text extract karna
        const pdfData = await pdf(req.file.buffer);
        const resumeText = pdfData.text;

        // 2. AI ko analysis ke liye bhejna
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as an HR Manager at Google. Analyze this resume text and give a score out of 100 with 3 brief improvement points.
        Resume Text: ${resumeText}
        Return ONLY JSON: {"score": 85, "bullets": ["point 1", "point 2", "point 3"], "feedback": "Overall summary"}`;

        const result = await model.generateContent(prompt);
        const analysis = cleanJSON(result.response.text());

        res.json({ success: true, ...analysis });
    } catch (error) {
        console.error("🔥 Resume Error:", error);
        res.status(500).json({ success: false, message: "Could not process PDF resume." });
    }
});

module.exports = router;