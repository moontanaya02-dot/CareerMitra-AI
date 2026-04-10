const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/student");

// JWT Secret Key (In real projects, keep this in .env)
const JWT_SECRET = process.env.JWT_SECRET || "career_mitra_secret_99";

// =============================
// 📝 SIGNUP API (Encrypted)
// =============================
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, branch } = req.body;

        let existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, msg: "Email already registered! ⚠️" });
        }

        // 🔥 PRO SECURITY: Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStudent = new Student({ 
            name, 
            email, 
            password: hashedPassword, 
            branch 
        });

        await newStudent.save();
        res.status(201).json({ success: true, msg: "Account created successfully! 🚀" });

    } catch (err) {
        res.status(500).json({ success: false, msg: "Registration failed. Try again!" });
    }
});

// =============================
// 🔐 LOGIN API (JWT Enabled)
// =============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const foundUser = await Student.findOne({ email });
        if (!foundUser) {
            return res.status(404).json({ success: false, msg: "User not found! ❌" });
        }

        // ✅ PRO SECURITY: Compare Hashed Password
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Invalid credentials! 🔑" });
        }

        // 🎟️ GENERATE TOKEN: Taaki user bar-bar logout na ho
        const token = jwt.sign({ id: foundUser._id }, JWT_SECRET, { expiresIn: "1d" });

        res.json({ 
            success: true, 
            msg: `Welcome back, ${foundUser.name}! ✨`,
            token,
            student: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                branch: foundUser.branch,
                skills: foundUser.skills,
                profileScore: foundUser.profileScore
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, msg: "Login server error" });
    }
});

module.exports = router;