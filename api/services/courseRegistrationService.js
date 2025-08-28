const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Courses = require("../models/coursesModel");
const User = require("../models/userModel");
const CoursePrerequisite = require("../models/coursePrerequisiteModel");
const StudentCourseRegistration = require("../models/studentCourseRegistrationModel");
const SemesterCourse = require("../models/semesterCourseModel");
const enrollmentService = require("./enrollmentService");

/**
 * @desc    Get recommended courses for a student based on all constraints
 * @route   GET /api/v1/students/:studentId/suggested-courses
 * @access  Private (Student, Admin)
 */
exports.getSuggestedCourses = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  // If student is making the request, use their ID
  const student = req.user.role === "student" ? req.user._id : studentId;

  if (!student) {
    return next(new ApiError("Student ID is required", 400));
  }

  // Get student information
  const studentInfo = await User.findById(student).select(
    "+gpa +major +academicLevel +completedCreditHours +semester"
  );
  if (!studentInfo) {
    return next(new ApiError("Student not found", 404));
  }

  // Check for any holds that would prevent registration
  const { hasHolds, holds } = await enrollmentService.checkStudentHolds(
    student
  );
  if (hasHolds) {
    const restrictingHolds = holds.filter((hold) => hold.restrictRegistration);
    console.log(restrictingHolds);
    if (restrictingHolds.length > 0) {
      return next(
        new ApiError(
          `Registration blocked due to: ${restrictingHolds
            .map((h) => h.type)
            .join(", ")}`,
          403
        )
      );
    }
  }

  const currentSemester = studentInfo.semester || 1;
  const studentMajor = studentInfo.major || "General";
  const studentLevel = studentInfo.academicLevel || 1;

  // Get student's GPA and max credit hours
  const gpa =
    studentInfo.gpa || (await enrollmentService.calculateStudentGPA(student));
  const maxCreditHours = await enrollmentService.getMaxCreditHours(gpa);

  // Get courses already taken or currently registered
  const studentRegistrations = await StudentCourseRegistration.find({
    student,
  }).select("course status isPassed grade");

  // Get passed course IDs to exclude from recommendations
  const passedCourseIds = studentRegistrations
    .filter((reg) => reg.status === "completed" && reg.isPassed)
    .map((reg) => reg.course.toString());

  // Get currently registered course IDs to exclude from recommendations
  const currentlyRegisteredCourseIds = studentRegistrations
    .filter(
      (reg) =>
        reg.status !== "completed" &&
        reg.status !== "dropped" &&
        reg.status !== "rejected"
    )
    .map((reg) => reg.course.toString());

  // Get failed courses that need to be retaken
  const failedRegistrations = await StudentCourseRegistration.find({
    student,
    status: "completed",
    isPassed: false,
  }).populate("course");

  // Extract the actual course objects from failed registrations
  const failedCourses = failedRegistrations.map((reg) => reg.course);

  // Check if student has completed any courses
  const hasCompletedCourses = passedCourseIds.length > 0;

  // If student is at level > 1 but hasn't completed any courses, include level 1 courses too
  let levelQuery = {};
  if (studentLevel > 1 && !hasCompletedCourses) {
    // Include courses from level 1 up to student's level + 1
    levelQuery = { academicLevel: { $gte: 1, $lte: studentLevel + 1 } };
  } else {
    // Normal case: only current and next level
    levelQuery = {
      academicLevel: { $gte: studentLevel, $lte: studentLevel + 1 },
    };
  }

  // Get courses that match the student's major and level criteria
  const availableCourses = await Courses.find({
    majors: { $in: [studentMajor, "General"] }, // Include General courses too
    ...levelQuery,
    _id: {
      $nin: [...passedCourseIds, ...currentlyRegisteredCourseIds], // Exclude passed and currently registered courses
    },
    isActive: true, // Only include active courses
  });

  // Check prerequisites and filter courses
  const coreCourses = [];
  const electiveCourses = [];
  const coursesWithPrereqs = [];
  const coursesWithoutPrereqs = [];

  // First, separate courses with and without prerequisites
  for (const course of availableCourses) {
    const prerequisites = await CoursePrerequisite.find({ course: course._id });

    if (prerequisites.length === 0) {
      coursesWithoutPrereqs.push(course);
    } else {
      coursesWithPrereqs.push(course);
    }
  }

  // Process courses without prerequisites first
  for (const course of coursesWithoutPrereqs) {
    // Debug log to see the course type
    console.log(`Course ${course.code} type: ${course.courseType}`);

    // Explicitly check if the course type is exactly "core"
    if (course.courseType === "core") {
      coreCourses.push(course);
    } else {
      electiveCourses.push(course);
    }
  }

  // Then check prerequisites for the remaining courses
  for (const course of coursesWithPrereqs) {
    const { passed } = await enrollmentService.checkPrerequisites(
      student,
      course._id
    );

    if (passed) {
      // Debug log to see the course type
      console.log(
        `Course with prereqs ${course.code} type: ${course.courseType}`
      );

      // Explicitly check if the course type is exactly "core"
      if (course.courseType === "core") {
        coreCourses.push(course);
      } else {
        electiveCourses.push(course);
      }
    }
  }

  // Special case: If no courses are found and student is at level > 1,
  // suggest level 1 courses that have no prerequisites
  if (
    coreCourses.length === 0 &&
    electiveCourses.length === 0 &&
    studentLevel > 1
  ) {
    const level1Courses = await Courses.find({
      majors: { $in: [studentMajor, "General"] },
      academicLevel: 1,
      _id: {
        $nin: [...passedCourseIds, ...currentlyRegisteredCourseIds],
      },
      isActive: true,
    });

    for (const course of level1Courses) {
      const prerequisites = await CoursePrerequisite.find({
        course: course._id,
      });

      // Only include courses with no prerequisites
      if (prerequisites.length === 0) {
        if (course.courseType === "core") {
          coreCourses.push(course);
        } else {
          electiveCourses.push(course);
        }
      }
    }
  }

  // Prioritize failed courses first
  const prioritizedFailedCourses = failedCourses.filter(
    (course) => !currentlyRegisteredCourseIds.includes(course._id.toString())
  );

  // Calculate total credit hours of recommended courses
  const failedCoursesCredits = prioritizedFailedCourses.reduce(
    (total, course) => total + (course?.creditHours || 0),
    0
  );

  const coreCoursesCredits = coreCourses.reduce(
    (total, course) => total + (course.creditHours || 0),
    0
  );

  // Calculate remaining credit hours for electives
  const remainingCreditHours =
    maxCreditHours - failedCoursesCredits - coreCoursesCredits;

  // Filter elective courses to stay within credit hour limit
  const recommendedElectives = [];
  let currentElectiveCredits = 0;

  // Sort electives by academic level (prioritize current level over next level)
  const sortedElectives = [...electiveCourses].sort((a, b) => {
    // First sort by academic level (current level first)
    if (a.academicLevel !== b.academicLevel) {
      // If one matches the student's level exactly, prioritize it
      if (a.academicLevel === studentLevel) return -1;
      if (b.academicLevel === studentLevel) return 1;
      return a.academicLevel - b.academicLevel;
    }
    // Then sort by credit hours (smaller first to maximize course variety)
    return a.creditHours - b.creditHours;
  });

  for (const course of sortedElectives) {
    if (
      currentElectiveCredits + (course.creditHours || 0) <=
      remainingCreditHours
    ) {
      recommendedElectives.push(course);
      currentElectiveCredits += course.creditHours || 0;
    }
  }

  // Update student's GPA in the database if needed
  if (!studentInfo.gpa) {
    const calculatedGpa = await enrollmentService.calculateStudentGPA(student);
    await User.findByIdAndUpdate(student, { gpa: calculatedGpa });
  }

  res.status(200).json({
    status: "success",
    data: {
      failedCourses: prioritizedFailedCourses,
      coreCourses,
      electiveCourses: recommendedElectives,
      maxCreditHours,
      currentGPA: gpa,
      currentCreditHours:
        failedCoursesCredits + coreCoursesCredits + currentElectiveCredits,
      remainingCreditHours:
        maxCreditHours -
        (failedCoursesCredits + coreCoursesCredits + currentElectiveCredits),
      holds: hasHolds ? holds : [],
      studentInfo: {
        academicLevel: studentLevel,
        major: studentMajor,
        completedCourses: passedCourseIds.length,
      },
    },
  });
});

/**
 * @desc    Register a student for a course
 * @route   POST /api/v1/course-registrations
 * @access  Private (Student, Admin)
 */
exports.registerCourse = asyncHandler(async (req, res, next) => {
  const { studentId, courseId, semester, academicYear } = req.body;

  // If student is making the request, use their ID
  const student = req.user.role === "student" ? req.user._id : studentId;

  if (!student || !courseId) {
    return next(new ApiError("Student ID and Course ID are required", 400));
  }

  // Check if student exists
  const studentInfo = await User.findById(student);
  if (!studentInfo) {
    return next(new ApiError("Student not found", 404));
  }

  // Check for any holds that would prevent registration
  const { hasHolds, holds } = await enrollmentService.checkStudentHolds(
    student
  );
  if (hasHolds) {
    const restrictingHolds = holds.filter((hold) => hold.restrictRegistration);
    if (restrictingHolds.length > 0) {
      return next(
        new ApiError(
          `Registration blocked due to: ${restrictingHolds
            .map((h) => h.type)
            .join(", ")}`,
          403
        )
      );
    }
  }

  // Check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Check if course is active
  if (!course.isActive) {
    return next(new ApiError("This course is not currently active", 400));
  }

  // Check if course is available for student's major
  const studentMajor = studentInfo.major || "General";

  // Add debug logging to see what's happening
  console.log("Student Major:", studentMajor);
  console.log("Course:", JSON.stringify(course, null, 2));

  // DIRECT APPROACH: Skip the normalization and directly check if the major is in the array
  // This bypasses any potential issues with how the majors array is being processed
  let majorIsAllowed = false;

  // Check if the course has majors defined
  if (course && course.majors && Array.isArray(course.majors)) {
    // Check if student's major is in the course majors or if "General" is in the course majors
    for (const major of course.majors) {
      const majorStr = String(major).trim();
      if (
        majorStr.toLowerCase() === studentMajor.toLowerCase() ||
        majorStr.toLowerCase() === "general"
      ) {
        majorIsAllowed = true;
        break;
      }
    }
  }

  console.log("Major is allowed:", majorIsAllowed);
  console.log(
    "Course majors:",
    course.majors ? JSON.stringify(course.majors) : "undefined"
  );

  if (!majorIsAllowed) {
    return next(
      new ApiError(
        `This course is not available for ${studentMajor} major`,
        400
      )
    );
  }

  // Get completed courses
  const completedCourses = await StudentCourseRegistration.find({
    student,
    status: "completed",
    isPassed: true,
  });

  // Special case: If student is at level > 1 but hasn't completed any courses,
  // allow them to register for level 1 courses without strict level checks
  const hasCompletedCourses = completedCourses.length > 0;
  const studentLevel = studentInfo.academicLevel || 1;
  const courseLevel = course.academicLevel || 1;

  let levelCheckPassed = enrollmentService.checkAcademicLevelEligibility(
    studentInfo,
    course
  );

  // If student is at level > 1 but hasn't completed any courses, allow level 1 courses
  if (studentLevel > 1 && !hasCompletedCourses && courseLevel === 1) {
    levelCheckPassed = true;
  }

  if (!levelCheckPassed) {
    return next(
      new ApiError(
        `This course is not available for your academic level (${studentInfo.academicLevel})`,
        400
      )
    );
  }

  // Check if student is trying to register for a course more than 1 semester ahead
  const currentSemester = studentInfo.semester || 1;
  const requestedSemester = semester || currentSemester;

  if (requestedSemester > currentSemester + 1) {
    return next(
      new ApiError(
        `Cannot register for courses more than 1 semester ahead of your current semester (${currentSemester})`,
        400
      )
    );
  }

  // Check if student is already registered for this course in the current semester
  const existingRegistration = await StudentCourseRegistration.findOne({
    student,
    course: courseId,
    semester: requestedSemester,
    academicYear,
    status: { $nin: ["dropped", "rejected"] },
  });

  if (existingRegistration) {
    return next(
      new ApiError("Student is already registered for this course", 400)
    );
  }

  // Check if this is a retake of a failed course
  const failedRegistration = await StudentCourseRegistration.findOne({
    student,
    course: courseId,
    status: "completed",
    isPassed: false,
  });

  // If not a retake, check prerequisites
  if (!failedRegistration) {
    // Check if course has prerequisites
    const prerequisites = await CoursePrerequisite.find({ course: courseId });

    // Only check prerequisites if the course has any
    if (prerequisites.length > 0) {
      const { passed, missingPrerequisites } =
        await enrollmentService.checkPrerequisites(student, courseId);

      if (!passed) {
        const requiredMissing = missingPrerequisites
          .filter((p) => p.isRequired)
          .map((p) => p.prerequisite.code || "Unknown")
          .join(", ");

        return next(
          new ApiError(
            `Missing required prerequisites: ${requiredMissing}`,
            400
          )
        );
      }
    }
  }

  // Check credit hour limit
  const gpa =
    studentInfo.gpa || (await enrollmentService.calculateStudentGPA(student));
  const maxCreditHours = await enrollmentService.getMaxCreditHours(gpa);

  // Get current semester registrations
  const currentRegistrations = await StudentCourseRegistration.find({
    student,
    semester: requestedSemester,
    academicYear,
    status: { $nin: ["dropped", "rejected", "completed"] },
  }).populate("course", "creditHours");

  const currentCreditHours = currentRegistrations.reduce(
    (total, reg) => total + (reg.course?.creditHours || 0),
    0
  );

  const courseCreditHours = course.creditHours || 3;

  if (currentCreditHours + courseCreditHours > maxCreditHours) {
    return next(
      new ApiError(
        `Cannot register for this course. It would exceed the maximum of ${maxCreditHours} credit hours. Current: ${currentCreditHours}, Course: ${courseCreditHours}`,
        400
      )
    );
  }

  // Check if the course is offered in the requested semester
  // For simplicity, we'll make this check optional if no semester courses are defined
  const semesterCourse = await SemesterCourse.findOne({
    course: courseId,
    semester: requestedSemester,
  });

  // Only enforce semester course check if there are semester courses defined for this course
  const semesterCourseCount = await SemesterCourse.countDocuments({
    course: courseId,
  });

  if (semesterCourseCount > 0 && !semesterCourse) {
    return next(
      new ApiError(
        `This course is not offered in semester ${requestedSemester}`,
        400
      )
    );
  }

  // Create registration
  const registration = await StudentCourseRegistration.create({
    student,
    course: courseId,
    semester: requestedSemester,
    academicYear,
    status: "pending", // Registrations need approval
  });

  res.status(201).json({
    status: "success",
    data: registration,
  });
});

/**
 * @desc    Register and mark a course as passed for a student (admin only)
 * @route   POST /api/v1/course-registrations/direct-pass
 * @access  Private (Admin)
 */
exports.registerAndPassCourse = asyncHandler(async (req, res, next) => {
  const { studentId, courseId, semester, academicYear, grade = "B" } = req.body;

  if (!studentId || !courseId) {
    return next(new ApiError("Student ID and Course ID are required", 400));
  }

  // Check if student exists
  const student = await User.findById(studentId);
  if (!student) {
    return next(new ApiError("Student not found", 404));
  }

  // Check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Check if student is already registered for this course
  const existingRegistration = await StudentCourseRegistration.findOne({
    student: studentId,
    course: courseId,
    status: { $nin: ["dropped", "rejected"] },
  });

  if (existingRegistration) {
    // If already registered but not completed, update it
    if (existingRegistration.status !== "completed") {
      existingRegistration.status = "completed";
      existingRegistration.grade = grade;
      existingRegistration.isPassed = grade !== "F";

      await existingRegistration.save();

      // Update student's completed credit hours if passed
      if (existingRegistration.isPassed) {
        student.completedCreditHours =
          (student.completedCreditHours || 0) + (course.creditHours || 0);
        await student.save();
      }

      // Update student's GPA
      const calculatedGpa = await enrollmentService.calculateStudentGPA(
        studentId
      );
      student.gpa = calculatedGpa;
      await student.save();

      return res.status(200).json({
        status: "success",
        message: "Existing registration updated and marked as passed",
        data: existingRegistration,
      });
    } else {
      return next(
        new ApiError(
          "Student is already registered and completed this course",
          400
        )
      );
    }
  }

  // Create a new registration with completed status
  const registration = await StudentCourseRegistration.create({
    student: studentId,
    course: courseId,
    semester: semester || 1,
    academicYear: academicYear || "2024-2025",
    status: "completed",
    grade,
    isPassed: grade !== "F",
    registrationDate: new Date(),
  });

  // Update student's completed credit hours if passed
  if (registration.isPassed) {
    student.completedCreditHours =
      (student.completedCreditHours || 0) + (course.creditHours || 0);
    await student.save();
  }

  // Update student's GPA
  const calculatedGpa = await enrollmentService.calculateStudentGPA(studentId);
  student.gpa = calculatedGpa;
  await student.save();

  res.status(201).json({
    status: "success",
    message: "Course registered and marked as passed",
    data: registration,
  });
});

/**
 * @desc    Auto-register required courses for first semester students
 * @route   POST /api/v1/students/:studentId/auto-register
 * @access  Private (Admin)
 */
exports.autoRegisterFirstSemesterCourses = asyncHandler(
  async (req, res, next) => {
    const { studentId } = req.params;
    const { academicYear } = req.body;

    if (!academicYear) {
      return next(new ApiError("Academic year is required", 400));
    }

    // Check if student exists and is in first semester
    const student = await User.findById(studentId);
    if (!student) {
      return next(new ApiError("Student not found", 404));
    }

    if (student.semester !== 1) {
      return next(
        new ApiError(
          "Auto-registration is only for first semester students",
          400
        )
      );
    }

    const studentMajor = student.major || "General";

    // Get all required courses for first semester that match student's major
    const coreCourses = await Courses.find({
      academicLevel: 1,
      courseType: "core",
      majors: { $in: [studentMajor, "General"] },
      isActive: true,
    });

    // Get semester courses that are required for first semester
    const semesterCourses = await SemesterCourse.find({
      course: { $in: coreCourses.map((c) => c._id) },
      semester: 1,
      isRequired: true,
    });

    // Create a map of course IDs to semester course objects
    const semesterCourseMap = {};
    semesterCourses.forEach((sc) => {
      semesterCourseMap[sc.course.toString()] = sc;
    });

    // Register student for each core course
    const registrations = [];
    const errors = [];

    for (const course of coreCourses) {
      try {
        // Check if already registered
        const existingRegistration = await StudentCourseRegistration.findOne({
          student: studentId,
          course: course._id,
        });

        if (existingRegistration) {
          continue;
        }

        // Check if course is required for this semester
        if (
          semesterCourses.length > 0 &&
          !semesterCourseMap[course._id.toString()]
        ) {
          errors.push(`Course ${course.code} is not required for semester 1`);
          continue;
        }

        // Create registration
        const registration = await StudentCourseRegistration.create({
          student: studentId,
          course: course._id,
          semester: 1,
          academicYear,
          status: "approved", // Auto-approved for first semester core courses
        });

        registrations.push(registration);
      } catch (error) {
        console.error(`Error registering for course ${course.code}:`, error);
        errors.push(
          `Error registering for course ${course.code}: ${error.message}`
        );
      }
    }

    res.status(201).json({
      status: "success",
      results: registrations.length,
      data: registrations,
      errors: errors.length > 0 ? errors : undefined,
    });
  }
);

/**
 * @desc    Update course registration status and grade
 * @route   PUT /api/v1/course-registrations/:id
 * @access  Private (Admin, Instructor)
 */
exports.updateCourseRegistration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, grade, notes } = req.body;

  const registration = await StudentCourseRegistration.findById(id);

  if (!registration) {
    return next(new ApiError("Registration not found", 404));
  }

  // Store previous status to check for changes
  const previousStatus = registration.status;
  const previousGrade = registration.grade;

  // Update fields
  if (status) registration.status = status;
  if (grade) registration.grade = grade;
  if (notes) registration.notes = notes;

  // If admin or instructor is approving, set approvedBy
  if (
    status === "approved" &&
    previousStatus !== "approved" &&
    (req.user.role === "admin" || req.user.role === "instructor")
  ) {
    registration.approvedBy = req.user._id;
  }

  // If a course is completed, determine if it's passed based on the grade
  if (status === "completed" && grade) {
    // Determine if passed based on grade (F is failing)
    registration.isPassed = grade !== "F";

    // If passed, update the student's completed credit hours
    if (registration.isPassed) {
      const course = await Courses.findById(registration.course);
      if (course) {
        const student = await User.findById(registration.student);
        if (student) {
          student.completedCreditHours =
            (student.completedCreditHours || 0) + (course.creditHours || 0);
          await student.save();
        }
      }
    }

    // Update student's GPA
    const student = await User.findById(registration.student);
    if (student) {
      const calculatedGpa = await enrollmentService.calculateStudentGPA(
        registration.student
      );
      student.gpa = calculatedGpa;
      await student.save();

      // Check if student can progress to next level
      if (status === "completed" && previousStatus !== "completed") {
        await enrollmentService.updateStudentLevelIfEligible(
          registration.student
        );
      }
    }
  }

  await registration.save();

  res.status(200).json({
    status: "success",
    data: registration,
  });
});

/**
 * @desc    Get student's course registrations
 * @route   GET /api/v1/students/:studentId/registrations
 * @access  Private (Student, Admin, Instructor)
 */
exports.getStudentRegistrations = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { semester, academicYear, status } = req.query;

  // If student is making the request, use their ID
  const student = req.user.role === "student" ? req.user._id : studentId;

  if (!student) {
    return next(new ApiError("Student ID is required", 400));
  }

  // Build query
  const query = { student };
  if (semester) query.semester = Number.parseInt(semester, 10);
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = status;

  const registrations = await StudentCourseRegistration.find(query)
    .populate("course")
    .populate("approvedBy", "name");

  res.status(200).json({
    status: "success",
    results: registrations.length,
    data: registrations,
  });
});

/**
 * @desc    Get all students registered for a specific course
 * @route   GET /api/v1/courses/:courseId/students
 * @access  Private (Admin, Instructor)
 */
exports.getStudentsByCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { semester, academicYear, status } = req.query;

  // Check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Build query
  const query = { course: courseId };
  if (semester) query.semester = Number.parseInt(semester, 10);
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = status;

  // Find all registrations for this course and populate student details
  const registrations = await StudentCourseRegistration.find(query)
    .populate({
      path: "student",
      select: "name email studentId major academicLevel gpa", // Include relevant student fields
    })
    .select(
      "student status grade registrationDate semester academicYear isPassed"
    );

  res.status(200).json({
    status: "success",
    results: registrations.length,
    data: registrations,
  });
});
////////////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
// recommendedCourses
exports.recommendedCourses = asyncHandler(async (req, res, next) => {
  const id = req.user.id;

  // 1. Get the user with populated passed courses
  const user = await User.findById(id).populate("passedCourses", "name code");
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: `No user found with the id: ${id}`,
    });
  }

  // 2. Get student's current registered courses from StudentCourseRegistration
  const registeredCourses = await StudentCourseRegistration.find({
    student: user._id,
  }).populate("course", "name code");

  console.log("registeredCourses:-----------", registeredCourses);

  // 3. Extract user data
  const { department, passedCourses } = user;
  const registeredCourseIds = registeredCourses.map((reg) => reg.course._id);
  console.log("registeredCourseIds:-----------", registeredCourseIds);
  // 4. Find all available courses
  const allCourses = await Courses.find();
  console.log("allCourses:-----------", allCourses);
  // 5. Get course prerequisites for filtering
  const coursePrerequisites = await CoursePrerequisite.find().populate(
    "course prerequisite"
  );
  console.log("coursePrerequisites:-----------", coursePrerequisites);
  // 6. Filter courses based on the following criteria:
  const recommendedCourses = allCourses.filter((course) => {
    // a. The course aligns with the student's department. If the department in the course is "all," then consider it.
    if (course.department !== "all" && course.department !== department) {
      return false;
    }

    console.log("recommendedCourses:-----------", recommendedCourses);
    // b. Check if student already registered for this course (from StudentCourseRegistration)
    if (
      registeredCourseIds.some(
        (regCourseId) => regCourseId.toString() === course._id.toString()
      )
    ) {
      return false;
    }

    // c. Check if student already passed this course
    if (
      passedCourses &&
      passedCourses.some(
        (passedCourse) => passedCourse._id.toString() === course._id.toString()
      )
    ) {
      return false;
    }

    // d. Check prerequisites
    const coursePrereq = coursePrerequisites.find(
      (cp) => cp.course._id.toString() === course._id.toString()
    );

    if (coursePrereq && coursePrereq.prerequisite) {
      // Check if student has passed the prerequisite course
      const hasMetPrerequisites =
        passedCourses &&
        passedCourses.some(
          (passedCourse) =>
            passedCourse._id.toString() ===
            coursePrereq.prerequisite._id.toString()
        );

      if (!hasMetPrerequisites) {
        return false;
      }
    }

    return true; // If all conditions are met, include the course
  });

  // 7. Send the response
  res.status(200).json({
    status: "success",
    results: recommendedCourses.length,
    data: recommendedCourses,
  });
});
