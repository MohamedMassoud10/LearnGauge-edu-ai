const mongoose = require('mongoose');
const slugify = require('slugify');

const lecturesSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      min: [1, 'Lecture number must be at least 1']
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    pdf: {
      type: String,
      required: [true, 'Lecture PDF file is required']
    },
    video: {
      type: String,
      default: null 
    },
      audio: {
      type: String,
      default: null 
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Courses',
      required: [true, 'Lecture must be associated with a course']
    },
    instructor: {
      type: mongoose.Schema.ObjectId, 
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

lecturesSchema.pre('save', async function (next) {
    if (!this.number) {
      const count = await mongoose.model('Lectures').countDocuments({ course: this.course });
      this.number = count + 1;
    }
    this.slug = slugify(`${this.course}-${this.number}`, { lower: true });

    next();
});

const Lectures = mongoose.model('Lectures', lecturesSchema);

module.exports = Lectures;