"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const FERReports = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterBy, setFilterBy] = useState("all"); // all, course, date
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, engagement, duration
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonReports, setComparisonReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const savedReports = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("lecture_report_")) {
        try {
          const report = JSON.parse(localStorage.getItem(key));
          // Filter by instructor if not admin
          if (
            user?.data?.role !== "admin" &&
            report.instructor !== user?.data?.name
          ) {
            continue;
          }
          savedReports.push({ id: key, ...report });
        } catch (error) {
          console.error("Error loading report:", error);
        }
      }
    }

    // Apply sorting
    savedReports.sort((a, b) => {
      switch (sortBy) {
        case "engagement":
          return b.overallEngagement - a.overallEngagement;
        case "duration":
          return b.duration - a.duration;
        case "date":
        default:
          return new Date(b.startTime) - new Date(a.startTime);
      }
    });

    // Apply filtering
    let filteredReports = savedReports;
    if (searchTerm) {
      filteredReports = savedReports.filter(
        (report) =>
          report.lectureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setReports(filteredReports);
  };

  useEffect(() => {
    loadReports();
  }, [sortBy, searchTerm]);

  const deleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      localStorage.removeItem(reportId);
      loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const exportReport = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.courseCode}_${report.lectureName.replace(
      /\s+/g,
      "_"
    )}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    const allReports = {
      exportDate: new Date().toISOString(),
      instructor: user?.data?.name,
      reports: reports,
      summary: {
        totalLectures: reports.length,
        averageEngagement: Math.round(
          reports.reduce((sum, r) => sum + r.overallEngagement, 0) /
            reports.length
        ),
        totalDuration: reports.reduce((sum, r) => sum + r.duration, 0),
      },
    };

    const blob = new Blob([JSON.stringify(allReports, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all_lecture_reports_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToComparison = (report) => {
    if (
      comparisonReports.length < 3 &&
      !comparisonReports.find((r) => r.id === report.id)
    ) {
      setComparisonReports([...comparisonReports, report]);
    }
  };

  const removeFromComparison = (reportId) => {
    setComparisonReports(comparisonReports.filter((r) => r.id !== reportId));
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEngagementColor = (engagement) => {
    if (engagement >= 80) return "text-green-600";
    if (engagement >= 60) return "text-blue-600";
    if (engagement >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getEngagementBadge = (engagement) => {
    if (engagement >= 80)
      return { text: "Excellent", bg: "bg-green-100", color: "text-green-800" };
    if (engagement >= 60)
      return { text: "Good", bg: "bg-blue-100", color: "text-blue-800" };
    if (engagement >= 40)
      return { text: "Fair", bg: "bg-yellow-100", color: "text-yellow-800" };
    return {
      text: "Needs Improvement",
      bg: "bg-red-100",
      color: "text-red-800",
    };
  };

  const calculateTrends = () => {
    if (reports.length < 2) return null;

    const recentReports = reports.slice(0, 5);
    const olderReports = reports.slice(5, 10);

    const recentAvg =
      recentReports.reduce((sum, r) => sum + r.overallEngagement, 0) /
      recentReports.length;
    const olderAvg =
      olderReports.length > 0
        ? olderReports.reduce((sum, r) => sum + r.overallEngagement, 0) /
          olderReports.length
        : recentAvg;

    const trend = recentAvg - olderAvg;
    return {
      trend: trend > 5 ? "improving" : trend < -5 ? "declining" : "stable",
      change: Math.abs(trend),
      recentAvg: Math.round(recentAvg),
      olderAvg: Math.round(olderAvg),
    };
  };

  const trends = calculateTrends();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-800">
                Lecture Reports & Analytics
              </h1>
              <button
                onClick={() => navigate("/fer")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Monitor
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.data?.name}
              </span>
              {reports.length > 0 && (
                <button
                  onClick={exportAllReports}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📊 Export All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Summary Dashboard */}
        {reports.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Teaching Performance Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {reports.length}
                </div>
                <div className="text-sm text-gray-600">Total Lectures</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(
                    reports.reduce((sum, r) => sum + r.overallEngagement, 0) /
                      reports.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Avg Engagement</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {formatDuration(
                    reports.reduce((sum, r) => sum + r.duration, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(
                    reports.reduce(
                      (sum, r) => sum + (r.teachingEffectiveness || 0),
                      0
                    ) / reports.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Avg Effectiveness</div>
              </div>
            </div>

            {/* Trends */}
            {trends && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Performance Trend</h3>
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center space-x-2 ${
                      trends.trend === "improving"
                        ? "text-green-600"
                        : trends.trend === "declining"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="text-2xl">
                      {trends.trend === "improving"
                        ? "📈"
                        : trends.trend === "declining"
                        ? "📉"
                        : "➡️"}
                    </span>
                    <span className="font-medium capitalize">
                      {trends.trend}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Recent avg: {trends.recentAvg}% vs Previous:{" "}
                    {trends.olderAvg}%
                    {trends.change > 0 &&
                      ` (${trends.change.toFixed(1)}% change)`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <input
                  type="text"
                  placeholder="Search lectures or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="engagement">Sort by Engagement</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showComparison
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📊 Compare ({comparisonReports.length})
              </button>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && comparisonReports.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Lecture Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lecture</th>
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Duration</th>
                    <th className="text-left p-2">Engagement</th>
                    <th className="text-left p-2">Effectiveness</th>
                    <th className="text-left p-2">Students</th>
                    <th className="text-left p-2">Alerts</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonReports.map((report) => (
                    <tr key={report.id} className="border-b">
                      <td className="p-2 font-medium">{report.lectureName}</td>
                      <td className="p-2">{report.courseCode}</td>
                      <td className="p-2">{formatDuration(report.duration)}</td>
                      <td
                        className={`p-2 font-bold ${getEngagementColor(
                          report.overallEngagement
                        )}`}
                      >
                        {report.overallEngagement}%
                      </td>
                      <td className="p-2">
                        {report.teachingEffectiveness || "N/A"}%
                      </td>
                      <td className="p-2">{report.averageStudentCount}</td>
                      <td className="p-2">{report.alerts}</td>
                      <td className="p-2">
                        <button
                          onClick={() => removeFromComparison(report.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Lecture History</h2>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500 mb-4">No lecture reports found</p>
                  <button
                    onClick={() => navigate("/fer")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Start Your First Lecture
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reports.map((report) => {
                    const badge = getEngagementBadge(report.overallEngagement);
                    return (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedReport && selectedReport.id === report.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-800">
                            {report.lectureName}
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.color}`}
                          >
                            {badge.text}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📚 {report.courseCode}</div>
                          <div>
                            📅 {new Date(report.startTime).toLocaleDateString()}
                          </div>
                          <div>⏱️ {formatDuration(report.duration)}</div>
                          <div
                            className={`font-medium ${getEngagementColor(
                              report.overallEngagement
                            )}`}
                          >
                            📊 {report.overallEngagement}% engagement
                          </div>
                        </div>
                        {showComparison && (
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToComparison(report);
                              }}
                              disabled={
                                comparisonReports.length >= 3 ||
                                comparisonReports.find(
                                  (r) => r.id === report.id
                                )
                              }
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                            >
                              + Compare
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedReport.lectureName}
                      </h2>
                      <p className="text-gray-600">
                        {selectedReport.courseCode} •{" "}
                        {new Date(selectedReport.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Instructor: {selectedReport.instructor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportReport(selectedReport)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📄 Export
                      </button>
                      <button
                        onClick={() => deleteReport(selectedReport.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDuration(selectedReport.duration)}
                      </div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedReport.averageStudentCount}
                      </div>
                      <div className="text-xs text-gray-600">Avg Students</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getEngagementBadge(selectedReport.overallEngagement).bg
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${getEngagementColor(
                          selectedReport.overallEngagement
                        )}`}
                      >
                        {selectedReport.overallEngagement}%
                      </div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedReport.teachingEffectiveness || "N/A"}%
                      </div>
                      <div className="text-xs text-gray-600">Effectiveness</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedReport.alerts}
                      </div>
                      <div className="text-xs text-gray-600">Alerts</div>
                    </div>
                  </div>

                  {selectedReport.notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Lecture Notes
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {selectedReport.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Emotion Distribution */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Student Emotion Analysis
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.entries(selectedReport.emotionBreakdown || {}).map(
                      ([emotion, count]) => {
                        const percentage = Math.round(
                          (count / selectedReport.totalCaptures) * 100
                        );
                        return (
                          <div
                            key={emotion}
                            className="text-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="text-2xl mb-1">
                              {emotion === "happy"
                                ? "😊"
                                : emotion === "focused"
                                ? "🎯"
                                : emotion === "confused"
                                ? "😕"
                                : emotion === "bored"
                                ? "😴"
                                : emotion === "surprised"
                                ? "😲"
                                : "😐"}
                            </div>
                            <div className="font-bold capitalize text-sm">
                              {emotion}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {count}
                            </div>
                            <div className="text-xs text-gray-600">
                              {percentage}%
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Engagement Trend */}
                {selectedReport.engagementTrend &&
                  selectedReport.engagementTrend.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Engagement Timeline
                      </h3>
                      <div className="flex items-end space-x-1 h-40 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {selectedReport.engagementTrend.map((point, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center min-w-0 flex-shrink-0"
                          >
                            <div
                              className={`w-6 rounded-t transition-all duration-300 ${
                                point.engagement >= 80
                                  ? "bg-green-500"
                                  : point.engagement >= 60
                                  ? "bg-blue-500"
                                  : point.engagement >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                height: `${Math.max(
                                  point.engagement * 1.2,
                                  10
                                )}px`,
                              }}
                              title={`${point.time}: ${point.engagement}%`}
                            />
                            <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left whitespace-nowrap">
                              {point.time.split(":").slice(0, 2).join(":")}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Excellent (80%+)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span>Good (60-79%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span>Fair (40-59%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Recommendations */}
                {selectedReport.recommendations &&
                  selectedReport.recommendations.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        AI-Generated Recommendations
                      </h3>
                      <div className="space-y-4">
                        {selectedReport.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              rec.priority === "high"
                                ? "border-red-500 bg-red-50"
                                : rec.priority === "medium"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-blue-500 bg-blue-50"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">
                                {rec.category === "Engagement"
                                  ? "🎯"
                                  : rec.category === "Clarity"
                                  ? "💡"
                                  : rec.category === "Pacing"
                                  ? "⏱️"
                                  : "📚"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-800">
                                    {rec.category}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      rec.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : rec.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <p className="font-medium text-gray-800 mb-1">
                                  {rec.suggestion}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {rec.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Alert History */}
                {selectedReport.alertBreakdown &&
                  Object.keys(selectedReport.alertBreakdown).length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Alert Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(selectedReport.alertBreakdown).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <span className="capitalize text-sm font-medium">
                                  {type.replace("_", " ")}
                                </span>
                                <span className="text-2xl font-bold text-red-600">
                                  {count}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {type === "low_engagement"
                                  ? "Times engagement dropped below threshold"
                                  : type === "high_confusion"
                                  ? "Periods of widespread confusion"
                                  : type === "attention_drop"
                                  ? "Consecutive attention decreases"
                                  : "Alert occurrences"}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Select a Lecture Report
                </h3>
                <p className="text-gray-600">
                  Choose a lecture from the list to view detailed analytics and
                  insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FERReports;
