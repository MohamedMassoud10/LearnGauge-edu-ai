const mongoose = require("mongoose");

const ferSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Emotion record must be associated with an instructor"],
    },
    course: {
      type: String,
      required: [true, "Emotion record must be associated with a course"],
    },
    lectureName: {
      type: String,
      required: [true, "Lecture name is required"],
      trim: true,
      maxlength: [100, "Lecture name cannot exceed 100 characters"],
    },
    // Store emotion data with capture timestamps
    emotionCaptures: [
      {
        captureTime: {
          type: Date,
          required: [true, "Capture time is required"],
        },
        faces: [
          {
            faceId: {
              type: Number,
              required: [true, "Face ID is required"],
            },
            emotion: {
              type: String,
              enum: [
                "happy",
                "sad",
                "angry",
                "neutral",
                "surprised",
                "fearful",
                "disgusted",
                "contempt",
              ],
              required: [true, "Emotion is required"],
            },
            confidence: {
              type: Number,
              min: [0, "Confidence must be at least 0"],
              max: [1, "Confidence cannot exceed 1"],
              required: [true, "Confidence is required"],
            },
          },
        ],
      },
    ],

    sessionSummary: {
      totalCaptures: {
        type: Number,
        default: 0,
      },
      avgFacesPerCapture: {
        type: Number,
        default: 0,
      },
      emotionDistribution: {
        happy: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
        surprised: { type: Number, default: 0 },
        fearful: { type: Number, default: 0 },
        disgusted: { type: Number, default: 0 },
        contempt: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// Index for efficient querying by instructor, course, and lecture
ferSchema.index({ instructor: 1, course: 1, lectureName: 1 });

// Method to calculate session summary
ferSchema.methods.calculateSummary = function () {
  const emotionCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
    contempt: 0,
  };

  let totalFaces = 0;

  this.emotionCaptures.forEach((capture) => {
    totalFaces += capture.faces.length;
    capture.faces.forEach((face) => {
      emotionCounts[face.emotion]++;
    });
  });

  this.sessionSummary = {
    totalCaptures: this.emotionCaptures.length,
    avgFacesPerCapture:
      this.emotionCaptures.length > 0
        ? Math.round((totalFaces / this.emotionCaptures.length) * 100) / 100
        : 0,
    emotionDistribution: emotionCounts,
  };
};

const FER = mongoose.model("FER", ferSchema);

module.exports = FER;
