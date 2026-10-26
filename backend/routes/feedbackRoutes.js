const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");

// GET: Display all feedback
router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add new feedback
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();

    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update existing feedback
router.put("/:id", async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove feedback
router.delete("/:id", async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;