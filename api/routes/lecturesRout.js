const express = require('express');

const {
  createLectureValidator,
  updateLectureValidator,
  getLectureValidator,
  deleteLectureValidator
}= require('../utils/validators/lecturesValidator')

const {
    getLectures,
    getLecture,
    createLecture,
    updateLecture,
    deleteLecture,
    uploadLectureFiles ,
    processLectureFiles
} = require("../services/lecturesService")

const authService = require('../services/authService');

const router = express.Router();

router.route('/')
.get(getLectures)
.post(
    authService.protect,
    authService.allowedTO('admin','instructor'),
    uploadLectureFiles ,
    processLectureFiles,
    createLectureValidator,
    createLecture
);
router.route("/:id")
.get(getLectureValidator,getLecture)
.put(
    authService.protect,
    authService.allowedTO('admin','instructor'),
    uploadLectureFiles  ,
    processLectureFiles,
    updateLectureValidator,
    updateLecture
)
.delete(
    authService.protect,
    authService.allowedTO('admin','instructor'),
    deleteLectureValidator,
    deleteLecture);

module.exports = router;