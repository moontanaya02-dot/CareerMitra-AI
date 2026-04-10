const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { 
        type: String, 
        required: [true, "Password is required"],
        minlength: 6 
    },
    branch: { 
        type: String, 
        default: "Computer Science Engineering", 
        trim: true 
    },
    skills: { 
        type: [String], 
        default: [] 
    }, 
    careerGoal: { 
        type: String, 
        default: "Full Stack Developer",
        trim: true
    },
    
    // --- PRO AI FEATURES ---
    
    // AI Roadmap: Object ki jagah hum structured roadmap store karenge
    roadmap: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },
    
    // AI Resume Feedback: Resume analyzer ka data yahan aayega
    resumeAnalysis: {
        score: { type: Number, default: 0 },
        feedback: { type: String, default: "" },
        suggestedSkills: [String]
    },

    // Dynamic Profile Score
    profileScore: {
        type: Number,
        default: 0
    },

    // Account Status for Security
    isActive: { type: Boolean, default: true }

}, { timestamps: true });

// --- PRO LOGIC: Advanced Profile Scoring ---
studentSchema.pre('save', function(next) {
    let score = 0;
    
    if (this.name) score += 10;
    if (this.email) score += 10;
    if (this.branch !== "General") score += 10;
    if (this.careerGoal) score += 20;
    
    // Skills based scoring (Max 30)
    if (this.skills && this.skills.length > 0) {
        score += Math.min(this.skills.length * 5, 30); 
    }
    
    // AI Roadmap generated status (Max 20)
    if (this.roadmap) score += 20;

    this.profileScore = score;
    next();
});

// Smart Export to prevent OverwriteModelError
module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);