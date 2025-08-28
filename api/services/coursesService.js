const factory = require("./handlerFactory");
const Courses = require("../models/coursesModel");

//@desc    Get list of courses
//@rout    GET /api/v1/courses
//@access  public
exports.getCourses = factory.getAll(Courses, "Courses", {
  path: "instructor",
  select: "name",
});

//@desc     Get specifc course by id
//@rout     GET /api/v1/courses/:id
//@access   public
exports.getCourse = factory.getOne(Courses);

//@desc     creat course
//@rout     POST api/v1/courses
//@access   private
exports.createCourse = factory.createOne(Courses);

//@desc     update specific course
//@rout     PUT api/v1/courses:id
//@access   private
exports.updateCourse = factory.updateOne(Courses);

//@desc     delet specific course
//@rout     DELET api/v1/courses:id
//@access   private
exports.deleteCourse = factory.deleteOne(Courses);
