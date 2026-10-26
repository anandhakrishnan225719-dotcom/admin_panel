const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      unique: true
    },

    courseName: {
      type: String,
      required: true
    },

    courseDuration: {
      type: String,
      default: "3 Months"
    },

    comments: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);

feedbackSchema.pre("validate", async function () {
  if (!this.courseId) {
    this.courseId = "C" + Date.now();
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);