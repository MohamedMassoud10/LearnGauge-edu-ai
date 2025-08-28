import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import MaxWidthWrapper from "../utils/MaxWidthWrapper";
import { useAuthContext } from "./../hooks/useAuthContext";
import { useInstructorCourses } from "../hooks/useTeacherCourses";

const API_KEY = "";

// Emotion colors now use green for happiness as seen in the image
const emotionColors = {
  happy: "bg-green-500 text-white",
  sad: "bg-blue-500 text-white",
  angry: "bg-red-500 text-white",
  neutral: "bg-gray-500 text-white",
  surprised: "bg-purple-500 text-white",
  fearful: "bg-indigo-500 text-white",
  disgusted: "bg-green-700 text-white",
  contempt: "bg-orange-500 text-white",
};

const FER = () => {
  const { user } = useAuthContext();
  const token = user?.token;
  const isInstructorId = user?.data?._id;
  const {
    data: AssignedCourses,
    isLoading: Loading,
    isError,
    refetch,
  } = useInstructorCourses(isInstructorId);
  console.log(AssignedCourses?.data?.data);
  const webcamRef = useRef(null);
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [cameraPermission, setCameraPermission] = useState("pending");
  const [facingMode, setFacingMode] = useState("user");
  const [isActive, setIsActive] = useState(false);
  const [nextCaptureIn, setNextCaptureIn] = useState(0);
  const captureIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // New state for backend integration
  const [courseId, setCourseId] = useState("");
  const [lectureName, setLectureName] = useState("");
  const [saveToBackend, setSaveToBackend] = useState(true);
  const [backendStatus, setBackendStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Store session data to send when inactive
  const sessionDataRef = useRef([]);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(
          (device) => device.kind === "videoinput"
        );
        setCameraAvailable(hasCamera);

        if (hasCamera) {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraPermission("granted");
          } catch (err) {
            setCameraPermission("denied");
          }
        }
      } catch (err) {
        setCameraAvailable(false);
        console.error("Error checking camera:", err);
      }
    };

    checkCamera();
  }, []);

  // Cleanup intervals on unmount and save data if needed
  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      // Save session data on component unmount if there's data
      if (
        sessionDataRef.current.length > 0 &&
        saveToBackend &&
        courseId &&
        lectureName &&
        token
      ) {
        // Use navigator.sendBeacon for reliable data sending on page unload
        const payload = JSON.stringify({
          course: courseId,
          lectureName: lectureName,
          sessionData: sessionDataRef.current,
        });

        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("http://127.0.0.1:8000/api/fer", blob);
      }
    };
  }, [saveToBackend, courseId, lectureName, token]);

  // Function to save all session emotion data to backend when becoming inactive
  const saveSessionToBackend = async () => {
    // Check if we should save and have required data
    if (
      !saveToBackend ||
      !courseId ||
      !lectureName ||
      !token ||
      sessionDataRef.current.length === 0 ||
      isSaving
    ) {
      console.log("Skipping save:", {
        saveToBackend,
        courseId: !!courseId,
        lectureName: !!lectureName,
        token: !!token,
        dataLength: sessionDataRef.current.length,
        isSaving,
      });
      return false;
    }

    setIsSaving(true);

    try {
      setBackendStatus("Saving session data to backend...");
      console.log("Sending data to backend:", {
        course: courseId,
        lectureName: lectureName,
        sessionDataCount: sessionDataRef.current.length,
        sampleData: sessionDataRef.current[0], // Log first entry for debugging
      });

      const payload = {
        course: courseId,
        lectureName: lectureName,
        sessionData: sessionDataRef.current, // Send all collected data
      };

      console.log("Full payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("http://127.0.0.1:8000/api/fer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Backend response status:", response.status);
      console.log("Backend response headers:", response.headers);

      let result;
      const responseText = await response.text();
      console.log("Backend response text:", responseText);

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 100)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: Failed to save to backend`
        );
      }

      setBackendStatus(
        `✓ Session data saved successfully (${sessionDataRef.current.length} records)`
      );

      console.log("Successfully saved session to backend:", result);

      // Clear session data after successful save
      sessionDataRef.current = [];

      // Clear status after 5 seconds
      setTimeout(() => {
        setBackendStatus("");
        setIsSaving(false);
      }, 5000);

      return true;
    } catch (error) {
      console.error("Error saving session to backend:", error);
      setBackendStatus(`❌ Backend error: ${error.message}`);

      // Clear error status after 8 seconds but keep isSaving false
      setTimeout(() => {
        setBackendStatus("");
        setIsSaving(false);
      }, 8000);

      return false;
    }
  };

  const startContinuousCapture = () => {
    // Clear any previous session data when starting new session
    sessionDataRef.current = [];

    // Validate required fields for backend saving
    if (saveToBackend && (!courseId || !lectureName)) {
      setError(
        "Please enter Course ID and Lecture Name to start monitoring with backend saving."
      );
      return;
    }

    setIsActive(true);
    setNextCaptureIn(15);
    setError(null);
    setBackendStatus(""); // Clear any previous backend status
    setIsSaving(false);

    // Immediate first capture
    captureAndAnalyze();

    // Set up 15-second interval for captures
    captureIntervalRef.current = setInterval(() => {
      captureAndAnalyze();
      setNextCaptureIn(15);
    }, 15000);

    // Countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setNextCaptureIn((prev) => {
        if (prev <= 1) {
          return 15; // Reset to 15 when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopContinuousCapture = async () => {
    console.log("Stopping continuous capture...");

    // First, stop the intervals
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setNextCaptureIn(0);

    // Save session data to backend when becoming inactive
    console.log(
      "Attempting to save session data...",
      sessionDataRef.current.length,
      "records"
    );

    const success = await saveSessionToBackend();

    if (success || sessionDataRef.current.length === 0) {
      setIsActive(false);
    } else {
      // If save failed, ask user what to do
      const retry = window.confirm(
        "Failed to save session data to backend. Do you want to retry saving before stopping? Click 'Cancel' to stop anyway and lose the data."
      );

      if (retry) {
        // Don't set isActive to false, let user try again
        return;
      } else {
        // User chose to stop anyway
        setIsActive(false);
        sessionDataRef.current = []; // Clear data since user chose to abandon it
      }
    }
  };

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image. Please try again.");
        return;
      }

      await analyzeEmotions(imageSrc);
    } catch (err) {
      console.error("Error capturing image:", err);
      setError("Failed to capture image. Please check camera permissions.");
    }
  };

  const saveToHistory = (facesResult) => {
    const timestamp = new Date().toLocaleTimeString();
    const historyEntry = {
      id: Date.now(),
      faces: facesResult,
      timestamp,
    };

    setHistory(
      (prev) => [historyEntry, ...prev].slice(0, 20) // Keep last 20 results
    );

    // Store in session data for backend submission when inactive
    const sessionEntry = {
      faces: facesResult,
      timestamp: new Date().toISOString(), // Use ISO format for backend
      captureTime: Date.now(),
    };

    sessionDataRef.current.push(sessionEntry);
    console.log(
      "Added to session data:",
      sessionEntry,
      "Total entries:",
      sessionDataRef.current.length
    );
  };

  const clearHistory = () => {
    setHistory([]);
    // Also clear session data
    sessionDataRef.current = [];
    console.log("Cleared history and session data");
  };

  const analyzeEmotions = async (imageSrc) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: imageSrc.split(",")[1],
                    },
                  },
                  {
                    text: 'Detect all faces in this image and analyze their emotions. Format your response as JSON with this structure: [{"id": 1, "emotion": "happy", "confidence": 0.85}, {"id": 2, "emotion": "neutral", "confidence": 0.92}, ...]. Use id to uniquely identify each face, emotion to describe the primary emotion (happy, sad, angry, neutral, surprised, fearful, disgusted, contempt), and confidence as a number from 0-1. If no faces are detected, return an empty array. Only return the JSON array, no additional text.',
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract the text response from Gemini
      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

      // Try to parse the JSON response
      let facesData = [];
      try {
        // Find JSON in the response text (it might have additional text)
        const jsonMatch = responseText.match(/\[.*\]/s);
        if (jsonMatch) {
          facesData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to trying to parse the whole response
          facesData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Error parsing facial emotion data:", parseError);
        console.log("Raw response:", responseText);
        facesData = [];
      }

      setFaces(facesData);
      saveToHistory(facesData);

      // Note: We no longer save to backend immediately here
      // Data will be saved when monitoring becomes inactive
    } catch (error) {
      console.error("Error analyzing emotions:", error);
      setError(`Failed to analyze emotions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderCameraStatus = () => {
    if (!cameraAvailable) {
      return (
        <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
          <p>No camera detected on your device.</p>
        </div>
      );
    }

    if (cameraPermission === "denied") {
      return (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg mb-4">
          <p>
            Camera permission denied. Please enable camera access in your
            browser settings.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <MaxWidthWrapper>
        {renderCameraStatus()}

        {error && (
          <div className="mx-4 my-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Backend Configuration Panel */}
        <div className="w-full mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Session Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isActive || isSaving || Loading}
              >
                <option value="">
                  {Loading ? "Loading courses..." : "Select a course"}
                </option>
                {AssignedCourses?.data?.data?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              {isError && (
                <p className="text-red-500 text-sm mt-1">
                  Error loading courses. Please refresh the page.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Name *
              </label>
              <input
                type="text"
                value={lectureName}
                onChange={(e) => setLectureName(e.target.value)}
                placeholder="Enter lecture name"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isActive || isSaving}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveToBackend}
                onChange={(e) => setSaveToBackend(e.target.checked)}
                className="mr-2"
                disabled={isActive || isSaving}
              />
              <span className="text-sm text-gray-700">
                Save results to backend when session ends
              </span>
            </label>

            {backendStatus && (
              <div
                className={`text-sm px-3 py-1 rounded ${
                  backendStatus.includes("✓")
                    ? "bg-green-100 text-green-700"
                    : backendStatus.includes("❌")
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {backendStatus}
              </div>
            )}
          </div>

          {/* Session Data Counter */}
          {(isActive || isSaving) && (
            <div className="mt-2 text-sm text-gray-600">
              📊 Captured {sessionDataRef.current.length} data points this
              session
              {isSaving && " (Saving...)"}
            </div>
          )}
        </div>

        <div className="w-full">
          {/* Camera View */}
          <div className="relative w-full min-h-24 rounded-lg overflow-hidden border-2 border-gray-300 bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              className="w-full h-[80vh] object-cover"
            />

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive
                      ? "bg-green-500"
                      : isSaving
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {isActive ? "ACTIVE" : isSaving ? "SAVING" : "INACTIVE"}
                </span>
              </div>
              {isActive && (
                <div className="text-xs mt-1">
                  Next capture in: {nextCaptureIn}s
                </div>
              )}
              {isActive && saveToBackend && (
                <div className="text-xs mt-1 text-yellow-300">
                  💾 Data will be saved when session ends
                </div>
              )}
              {isSaving && (
                <div className="text-xs mt-1 text-yellow-300">
                  💾 Saving session data...
                </div>
              )}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="mt-4 flex justify-center gap-4">
            {!isActive ? (
              <button
                onClick={startContinuousCapture}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || cameraPermission !== "granted" || isSaving}
              >
                <div className="w-3 h-3 rounded-full bg-white"></div>
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={stopContinuousCapture}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                <div className="w-3 h-3 bg-white"></div>
                {isSaving ? "Saving..." : "Stop Monitoring"}
              </button>
            )}
          </div>

          {/* Current Results */}
          {faces.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">
                Current Detection Results
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {faces.map((face) => (
                  <div
                    key={face.id}
                    className={`p-3 rounded-lg ${
                      emotionColors[face.emotion.toLowerCase()] ||
                      emotionColors.neutral
                    }`}
                  >
                    <p className="font-bold">Student {face.id}</p>
                    <p className="capitalize">
                      {face.emotion} ({Math.round(face.confidence * 100)}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Detection History</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isActive || isSaving}
                >
                  Clear History
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Scan #{entry.id}</span>
                      <span className="text-sm text-gray-500">
                        {entry.timestamp}
                      </span>
                    </div>
                    {entry.faces.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {entry.faces.map((face) => (
                          <div
                            key={face.id}
                            className={`p-2 rounded text-xs ${
                              emotionColors[face.emotion.toLowerCase()] ||
                              emotionColors.neutral
                            }`}
                          >
                            <div>
                              S{face.id}: {face.emotion}
                            </div>
                            <div>({Math.round(face.confidence * 100)}%)</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No faces detected</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default FER;
