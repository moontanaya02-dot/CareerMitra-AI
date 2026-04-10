const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ✅ GET ALL: Saare students ki list fetch karna
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().select("-password"); // Security tip: Password hide kar dena
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch students: " + error.message });
    }
});

// ✅ POST: Naya student register karna (Signup logic)
router.post("/", async (req, res) => {
    try {
        const { email } = req.body;
        // Pro Tip: Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Student with this email already exists." });
        }

        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student); // 201 Created status use karna better hai
    } catch (err) {
        res.status(400).json({ error: "Validation failed: " + err.message });
    }
});

// ✅ GET SINGLE: Specific student ka profile (AI Roadmap ke liye zaroori)
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: "Invalid ID format" });
    }
});

// ✅ PUT: Profile update karna (Experience/Skills update ke liye)
router.put("/:id", async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // $set use karna safer hota hai partial updates ke liye
            { new: true, runValidators: true } // runValidators se update ke waqt bhi rules check hote hain
        );
        if (!updated) return res.status(404).json({ message: "Update failed: Student not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: "Update error: " + err.message });
    }
});

// ✅ DELETE: Account remove karna
router.delete("/:id", async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;