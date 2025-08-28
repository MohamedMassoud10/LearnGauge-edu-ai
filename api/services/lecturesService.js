const factory = require("./handlerFactory");
const { uploadMixedFiles } = require("../middlewares/uploadefileMiddleware");
const Lectures = require("../models/lecturesModel");

// Upload lecture file
exports.uploadLectureFiles = uploadMixedFiles();

// Middleware to process uploaded files
exports.processLectureFiles = (req, res, next) => {
  const host = `${req.protocol}://${req.get("host")}`; // Get the full host URL

  if (req.files) {
    if (req.files.pdf)
      req.body.pdf = `${host}/uploads/lectures/${req.files.pdf[0].filename}`;
    if (req.files.video)
      req.body.video = `${host}/uploads/videos/${req.files.video[0].filename}`;
    if (req.files.audio)
      req.body.audio = `${host}/uploads/audios/${req.files.audio[0].filename}`;
  }

  next();
};

//@desc    Get list of lectures
//@rout    GET /api/v1/lectures
//@access  public
exports.getLectures = factory.getAll(Lectures);

//@desc     Get specifc lecture by id
//@rout     GET /api/v1/lectures/:id
//@access   public
exports.getLecture = factory.getOne(Lectures);

//@desc     creat lecture
//@rout     POST api/v1/lectures
//@access   private
exports.createLecture = factory.createOne(Lectures);

//@desc     update specific lecture
//@rout     PUT api/v1/lectures:id
//@access   private
exports.updateLecture = factory.updateOne(Lectures);

//@desc     delet specific lectuer
//@rout     DELET api/v1/lectuers:id
//@access   private
exports.deleteLecture = factory.deleteOne(Lectures);
