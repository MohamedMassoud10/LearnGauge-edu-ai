const mongoose = require("mongoose");
const User = require("../models/userModel");
const Courses = require("../models/coursesModel");
const CoursePrerequisite = require("../models/coursePrerequisiteModel");
const StudentCourseRegistration = require("../models/studentCourseRegistrationModel");
const GPARule = require("../models/gpaRuleModel");
const LevelProgression = require("../models/levelProgressionModel");

/**
 * Calculate a student's GPA based on completed courses
 * @param {string} studentId - The student's ID
 * @returns {Promise<number>} - The calculated GPA
 */
exports.calculateStudentGPA = async (studentId) => {
  const registrations = await StudentCourseRegistration.find({
    student: studentId,
    status: "completed",
  }).populate("course", "creditHours");

  if (!registrations.length) return 0;

  let totalPoints = 0;
  let totalCreditHours = 0;

  // Grade point values - expanded to include all possible grades
  const gradePoints = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
    IP: 0.0, // In Progress
    W: 0.0, // Withdrawn
    "": 0.0,
    Pass: 2.0, // Assuming Pass is equivalent to C
  };

  for (const reg of registrations) {
    if (reg.grade && reg.course) {
      const points = gradePoints[reg.grade] || 0;
      const creditHours = reg.course.creditHours || 0;

      totalPoints += points * creditHours;
      totalCreditHours += creditHours;
    }
  }

  return totalCreditHours > 0
    ? Number.parseFloat((totalPoints / totalCreditHours).toFixed(2))
    : 0;
};

/**
 * Get the maximum allowed credit hours based on a student's GPA
 * @param {number} gpa - The student's GPA
 * @returns {Promise<number>} - The maximum allowed credit hours
 */
exports.getMaxCreditHours = async (gpa) => {
  const rule = await GPARule.findOne({
    minGPA: { $lte: gpa },
    maxGPA: { $gte: gpa },
  });

  // Default to 12 credit hours if no rule is found
  return rule ? rule.maxCreditHours : 12;
};

/**
 * Helper function to check if a grade meets the minimum required grade
 * @param {string} actualGrade - The actual grade received
 * @param {string} minimumGrade - The minimum required grade
 * @returns {boolean} - Whether the grade meets the minimum
 */
const meetsMinimumGrade = (actualGrade, minimumGrade) => {
  const gradeValues = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
    IP: 0.0,
    W: 0.0,
    "": 0.0,
    Pass: 2.0,
  };

  return (gradeValues[actualGrade] || 0) >= (gradeValues[minimumGrade] || 0);
};

/**
 * Check if a student has completed all prerequisites for a course
 * @param {string} studentId - The student's ID
 * @param {string} courseId - The course ID to check
 * @returns {Promise<{passed: boolean, missingPrerequisites: Array}>}
 */
exports.checkPrerequisites = async (studentId, courseId) => {
  // Get all prerequisites for the course
  const prerequisites = await CoursePrerequisite.find({
    course: courseId,
  }).populate("prerequisite");

  if (!prerequisites.length) {
    return { passed: true, missingPrerequisites: [] };
  }

  // Get all completed courses for the student
  const completedCourses = await StudentCourseRegistration.find({
    student: studentId,
    status: "completed",
  }).select("course grade isPassed");

  // Create a map for faster lookups
  const completedCoursesMap = {};
  completedCourses.forEach((course) => {
    completedCoursesMap[course.course.toString()] = {
      grade: course.grade,
      isPassed: course.isPassed,
    };
  });

  const missingPrerequisites = [];

  // Check each prerequisite
  for (const prereq of prerequisites) {
    const prereqId = prereq.prerequisite._id.toString();
    const courseData = completedCoursesMap[prereqId];

    // If prerequisite is not completed or minimum grade not met
    if (
      !courseData ||
      !courseData.isPassed ||
      !meetsMinimumGrade(courseData.grade, prereq.minimumGrade)
    ) {
      missingPrerequisites.push({
        prerequisite: prereq.prerequisite,
        isRequired: prereq.isRequired,
        minimumGrade: prereq.minimumGrade,
      });
    }
  }

  // Check if any required prerequisites are missing
  const missingRequired = missingPrerequisites.filter((p) => p.isRequired);

  return {
    passed: missingRequired.length === 0,
    missingPrerequisites,
  };
};

/**
 * Check if a course is appropriate for a student's academic level
 * @param {Object} student - The student object
 * @param {Object} course - The course object
 * @returns {boolean} - Whether the course is appropriate for the student's level
 */
exports.checkAcademicLevelEligibility = (student, course) => {
  const studentLevel = student.academicLevel || 1;
  const courseLevel = course.academicLevel || 1;

  // Students can only take courses at their current level
  // or one level above their current level
  return courseLevel >= studentLevel && courseLevel <= studentLevel + 1;
};

/**
 * Get all courses a student has failed and needs to retake
 * @param {string} studentId - The student's ID
 * @returns {Promise<Array>} - Array of failed courses
 */
exports.getFailedCourses = async (studentId) => {
  const failedRegistrations = await StudentCourseRegistration.find({
    student: studentId,
    status: "completed",
    isPassed: false,
  }).populate("course");

  return failedRegistrations.map((reg) => reg.course);
};

/**
 * Check if a student can progress to the next academic level
 * @param {string} studentId - The student's ID
 * @returns {Promise<{canProgress: boolean, nextLevel: number, reason: string}>}
 */
exports.checkLevelProgression = async (studentId) => {
  const student = await User.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const currentLevel = student.academicLevel || 1;

  // If already at max level
  if (currentLevel >= 8) {
    return {
      canProgress: false,
      nextLevel: currentLevel,
      reason: "Already at maximum academic level",
    };
  }

  // Get progression rule for current level
  const progressionRule = await LevelProgression.findOne({
    fromLevel: currentLevel,
    toLevel: currentLevel + 1,
  });

  if (!progressionRule) {
    return {
      canProgress: false,
      nextLevel: currentLevel,
      reason: "No progression rule found for current level",
    };
  }

  // Check if student meets credit hour requirement
  const completedCreditHours = student.completedCreditHours || 0;
  if (completedCreditHours < progressionRule.requiredCreditHours) {
    return {
      canProgress: false,
      nextLevel: currentLevel,
      reason: `Insufficient credit hours. Need ${progressionRule.requiredCreditHours}, has ${completedCreditHours}`,
    };
  }

  // Check if student meets GPA requirement
  const gpa = student.gpa || (await this.calculateStudentGPA(studentId));
  if (gpa < progressionRule.requiredGPA) {
    return {
      canProgress: false,
      nextLevel: currentLevel,
      reason: `GPA too low. Need ${progressionRule.requiredGPA}, has ${gpa}`,
    };
  }

  return {
    canProgress: true,
    nextLevel: currentLevel + 1,
    reason: "Meets all requirements for progression",
  };
};

/**
 * Attempt to update a student's academic level if they meet requirements
 * @param {string} studentId - The student's ID
 * @returns {Promise<{updated: boolean, newLevel: number, message: string}>}
 */
exports.updateStudentLevelIfEligible = async (studentId) => {
  const { canProgress, nextLevel, reason } = await this.checkLevelProgression(
    studentId
  );

  if (canProgress) {
    await User.findByIdAndUpdate(studentId, { academicLevel: nextLevel });
    return {
      updated: true,
      newLevel: nextLevel,
      message: `Student advanced to level ${nextLevel}`,
    };
  }

  return {
    updated: false,
    newLevel: null,
    message: reason,
  };
};

/**
 * Get the total credit hours for a set of courses
 * @param {Array} courses - Array of course objects
 * @returns {number} - Total credit hours
 */
exports.calculateTotalCreditHours = (courses) => {
  return courses.reduce((total, course) => {
    return total + (course.creditHours || 0);
  }, 0);
};

/**
 * Update a student's GPA in the database
 * @param {string} studentId - The student's ID
 * @returns {Promise<number>} - The updated GPA
 */
exports.updateStudentGPA = async (studentId) => {
  const gpa = await this.calculateStudentGPA(studentId);
  await User.findByIdAndUpdate(studentId, { gpa });
  return gpa;
};

/**
 * Check if a student has any holds that would prevent registration
 * @param {string} studentId - The student's ID
 * @returns {Promise<{hasHolds: boolean, holds: Array}>}
 */
exports.checkStudentHolds = async (studentId) => {
  // This is a placeholder for a more complex hold system
  // In a real system, you might check for financial holds, academic probation, etc.
  const student = await User.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Example: Students with GPA below 1.0 are on academic probation
  const gpa = student.gpa || (await this.calculateStudentGPA(studentId));
  const holds = [];

  return {
    hasHolds: holds.length > 0,
    holds,
  };
};
