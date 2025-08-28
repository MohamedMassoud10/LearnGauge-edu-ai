"use client";

import { useState, useRef } from "react";
import { FiX, FiUpload, FiFile, FiVideo, FiMusic } from "react-icons/fi";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useCreateLecture } from "../../../hooks/useLectures";
import notify from "../../../hooks/useNotifaction";

export default function AddLectureModal({
  isOpen,
  onClose,
  courseId,
  courseNumber,
}) {
  const { user } = useAuthContext();
  const createLectureMutation = useCreateLecture();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    title: "",
  });

  // File references
  const pdfRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // File states
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // Error state
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === "pdf") {
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file");
        return;
      }
      setPdfFile(file);
    } else if (fileType === "video") {
      if (!file.type.includes("video/")) {
        setError("Please upload a valid video file");
        return;
      }
      setVideoFile(file);
    } else if (fileType === "audio") {
      if (!file.type.includes("audio/")) {
        setError("Please upload a valid audio file");
        return;
      }
      setAudioFile(file);
    }

    setError("");
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pdfFile) {
      setError("PDF file is required");
      return;
    }

    if (!formData.number || !formData.title) {
      setError("Lecture number and title are required");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData object for file uploads
      const lectureFormData = new FormData();
      lectureFormData.append("number", formData.number);
      lectureFormData.append("title", formData.title);
      lectureFormData.append("slug", generateSlug(formData.title));
      lectureFormData.append("course", courseId);
      lectureFormData.append("instructor", user?.data?._id);

      // Append files
      lectureFormData.append("pdf", pdfFile);
      if (videoFile) lectureFormData.append("video", videoFile);
      if (audioFile) lectureFormData.append("audio", audioFile);

      // Submit the form
      await createLectureMutation.mutateAsync(lectureFormData);
      notify("Lecture added successfully !", "success");
      // Reset form and close modal
      setFormData({ number: "", title: "" });
      setPdfFile(null);
      setVideoFile(null);
      setAudioFile(null);
      onClose();
    } catch (err) {
      console.error("Error creating lecture:", err);
      setError(err.response?.data?.message || "Failed to create lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add New Lecture</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            {/* Lecture Number */}
            <div>
              <label
                htmlFor="number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lecture Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* Lecture Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lecture Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF Document <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  pdfFile ? "border-green-300 bg-green-50" : "border-gray-300"
                }`}
                onClick={() => pdfRef.current.click()}
              >
                <input
                  type="file"
                  ref={pdfRef}
                  onChange={(e) => handleFileChange(e, "pdf")}
                  accept=".pdf"
                  className="hidden"
                />

                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FiFile className="text-xl" />
                    <span className="font-medium">{pdfFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <FiUpload className="text-2xl mb-2" />
                    <p className="font-medium">Upload PDF</p>
                    <p className="text-xs mt-1">Required</p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video (Optional)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    videoFile ? "border-blue-300 bg-blue-50" : "border-gray-300"
                  }`}
                  onClick={() => videoRef.current.click()}
                >
                  <input
                    type="file"
                    ref={videoRef}
                    onChange={(e) => handleFileChange(e, "video")}
                    accept="video/*"
                    className="hidden"
                  />

                  {videoFile ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <FiVideo className="text-xl" />
                      <span className="font-medium">{videoFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <FiVideo className="text-2xl mb-2" />
                      <p className="font-medium">Upload Video</p>
                      <p className="text-xs mt-1">Optional</p>
                    </div>
                  )}
                </div>
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio (Optional)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    audioFile
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => audioRef.current.click()}
                >
                  <input
                    type="file"
                    ref={audioRef}
                    onChange={(e) => handleFileChange(e, "audio")}
                    accept="audio/*"
                    className="hidden"
                  />

                  {audioFile ? (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <FiMusic className="text-xl" />
                      <span className="font-medium">{audioFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <FiMusic className="text-2xl mb-2" />
                      <p className="font-medium">Upload Audio</p>
                      <p className="text-xs mt-1">Optional</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Lecture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
