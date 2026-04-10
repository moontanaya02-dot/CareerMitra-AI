const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); // Security ke liye
const rateLimit = require('express-rate-limit'); // Spam control ke liye
require('dotenv').config();

// Humne jo db.js banaya tha, use yahan import kar rahe hain
const connectDB = require('./config/db'); 

const app = express();

// --- 🛡️ PRO SECURITY MIDDLEWARES ---
app.use(helmet({
    contentSecurityPolicy: false, // Taki external AI APIs block na ho
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting: Ek IP se 15 minute mein sirf 100 requests (AI cost bachaane ke liye)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: "Too many requests, please try again later."
});
app.use('/api/', limiter);

// --- 📡 TERMINAL LOGGER (CLEAN VERSION) ---
app.use((req, res, next) => {
    const time = new Date().toLocaleTimeString();
    console.log(`📡 [${time}] ${req.method} -> ${req.url}`);
    next();
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// --- 🛤️ ROUTES SETUP ---
app.use('/api/ai', require('./routes/ai'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));

// --- 🌐 FRONTEND ROUTING ---
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- ⚠️ GLOBAL ERROR HANDLING (PRO VERSION) ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(`🔥 Error: ${err.message}`);
    res.status(statusCode).json({ 
        success: false, 
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
});

// --- 🚀 DATABASE & SERVER LAUNCH ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Pehle Database connect hoga, phir server start hoga
        await connectDB(); 
        
        app.listen(PORT, () => {
            console.log(`
            *********************************************
            ✨ CAREERMITRA AI IS LIVE!
            🌍 URL: http://localhost:${PORT}
            🚀 Mode: ${process.env.NODE_ENV || 'development'}
            *********************************************
            `);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
    }
};

startServer();