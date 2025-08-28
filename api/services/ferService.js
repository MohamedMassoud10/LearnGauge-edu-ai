const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const FER = require("../models/ferModel");

exports.createEmotionRecord = asyncHandler(async (data) => {
  const { instructor, course, lectureName, sessionData } = data;

  // Validate input
  if (
    !instructor ||
    !course ||
    !lectureName ||
    !sessionData ||
    !Array.isArray(sessionData)
  ) {
    throw new ApiError("Missing required fields or invalid session data", 400);
  }

  console.log("Processing session data:", {
    instructor,
    course,
    lectureName,
    sessionDataLength: sessionData.length,
  });

  // Format emotion captures from session data
  const emotionCaptures = sessionData.map((capture) => {
    const faces = capture.faces.map((face) => ({
      faceId: face.id,
      emotion: face.emotion.toLowerCase(),
      confidence: face.confidence,
    }));

    return {
      captureTime: new Date(capture.timestamp),
      faces: faces,
    };
  });

  try {
    // Find existing record or create new one
    let record = await FER.findOne({ instructor, course, lectureName });

    if (record) {
      // Update existing record by adding new captures
      record.emotionCaptures.push(...emotionCaptures);
    } else {
      // Create new record
      record = new FER({
        instructor,
        course,
        lectureName,
        emotionCaptures,
      });
    }

    // Calculate session summary
    record.calculateSummary();

    // Save the record
    await record.save();

    console.log("Successfully saved emotion record:", {
      recordId: record._id,
      totalCaptures: record.sessionSummary.totalCaptures,
      avgFacesPerCapture: record.sessionSummary.avgFacesPerCapture,
    });

    return record;
  } catch (error) {
    console.error("Error saving emotion record:", error);
    throw new ApiError(`Failed to save emotion record: ${error.message}`, 500);
  }
});

exports.getEmotionRecords = asyncHandler(
  async ({ instructor, course, lectureName }) => {
    const query = { instructor };
    if (course) query.course = course;
    if (lectureName) query.lectureName = lectureName;

    try {
      const records = await FER.find(query)
        .populate("instructor", "name email")
        .populate("course", "title description")
        .sort({ createdAt: -1 }); // Sort by most recent first

      return records;
    } catch (error) {
      console.error("Error fetching emotion records:", error);
      throw new ApiError(
        `Failed to fetch emotion records: ${error.message}`,
        500
      );
    }
  }
);

exports.getEmotionRecordById = asyncHandler(async (recordId, instructor) => {
  try {
    const record = await FER.findOne({ _id: recordId, instructor })
      .populate("instructor", "name email")
      .populate("course", "title description");

    if (!record) {
      throw new ApiError("Emotion record not found", 404);
    }

    return record;
  } catch (error) {
    console.error("Error fetching emotion record by ID:", error);
    throw new ApiError(`Failed to fetch emotion record: ${error.message}`, 500);
  }
});

exports.deleteEmotionRecord = asyncHandler(async (recordId, instructor) => {
  try {
    const record = await FER.findOneAndDelete({ _id: recordId, instructor });

    if (!record) {
      throw new ApiError("Emotion record not found", 404);
    }

    return record;
  } catch (error) {
    console.error("Error deleting emotion record:", error);
    throw new ApiError(
      `Failed to delete emotion record: ${error.message}`,
      500
    );
  }
});
