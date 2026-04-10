const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Isse password secure hoga

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Please provide your name"],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Please provide your email"], 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false // Login ke alawa password hide rahega
    },
    role: { 
        type: String, 
        enum: ["student", "mentor", "admin"], 
        default: "student" 
    },
    profileImage: { 
        type: String, 
        default: "default.jpg" 
    }
}, { timestamps: true });

// --- PRO SECURITY: Password Hashing ---
// Data save hone se pehle password ko encrypt karein
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password during login
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);