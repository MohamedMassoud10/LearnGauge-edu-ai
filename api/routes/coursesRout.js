const express = require("express");

const {
  getCourseValidator,
  createCourseValidator,
  updateCourseValidator,
  deleteCourseValidator,
} = require("../utils/validators/coursesValidator");

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../services/coursesService");

const authService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getCourses)
  .post(
    authService.protect,
    authService.allowedTO("admin"),
    createCourseValidator,
    createCourse
  );
router
  .route("/:id")
  .get(getCourseValidator, getCourse)
  .put(
    authService.protect,
    authService.allowedTO("admin"),
    updateCourseValidator,
    updateCourse
  )
  .delete(
    authService.protect,
    authService.allowedTO("admin"),
    deleteCourseValidator,
    deleteCourse
  );

module.exports = router;
