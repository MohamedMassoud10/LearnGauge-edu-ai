const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect, allowedTO } = require("../services/authService");
const {
  createEmotionRecord,
  getEmotionRecords,
  getEmotionRecordById,
  deleteEmotionRecord,
} = require("../services/ferService");
const {
  createEmotionRecordValidator,
  getEmotionRecordsValidator,
} = require("../utils/validators/ferValidator");

const router = express.Router();

// Protect all routes and allow only instructors
router.use(protect, allowedTO("instructor"));

// Create emotion record
router.post(
  "/",
  createEmotionRecordValidator,
  asyncHandler(async (req, res, next) => {
    try {
      const { course, lectureName, sessionData } = req.body;

      console.log("Received FER request:", {
        instructorId: req.user._id,
        course,
        lectureName,
        sessionDataLength: sessionData?.length || 0,
      });

      const record = await createEmotionRecord({
        instructor: req.user._id,
        course,
        lectureName,
        sessionData,
      });

      res.status(201).json({
        status: "success",
        message: "Emotion record created successfully",
        data: {
          id: record._id,
          lectureName: record.lectureName,
          totalCaptures: record.sessionSummary.totalCaptures,
          avgFacesPerCapture: record.sessionSummary.avgFacesPerCapture,
          emotionDistribution: record.sessionSummary.emotionDistribution,
          createdAt: record.createdAt,
        },
      });
    } catch (error) {
      console.error("Error in POST /fer:", error);
      next(error);
    }
  })
);

// Get emotion records
router.get(
  "/",
  getEmotionRecordsValidator,
  asyncHandler(async (req, res, next) => {
    try {
      const { course, lectureName } = req.query;

      const records = await getEmotionRecords({
        instructor: req.user._id,
        course,
        lectureName,
      });

      res.status(200).json({
        status: "success",
        results: records.length,
        data: records,
      });
    } catch (error) {
      console.error("Error in GET /fer:", error);
      next(error);
    }
  })
);

// Get specific emotion record by ID
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    try {
      const record = await getEmotionRecordById(req.params.id, req.user._id);

      res.status(200).json({
        status: "success",
        data: record,
      });
    } catch (error) {
      console.error("Error in GET /fer/:id:", error);
      next(error);
    }
  })
);

// Delete emotion record
router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    try {
      await deleteEmotionRecord(req.params.id, req.user._id);

      res.status(200).json({
        status: "success",
        message: "Emotion record deleted successfully",
      });
    } catch (error) {
      console.error("Error in DELETE /fer/:id:", error);
      next(error);
    }
  })
);

module.exports = router;
