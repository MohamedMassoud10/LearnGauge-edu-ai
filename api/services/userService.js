const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const factory = require("./handlerFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadeImageMiddleware");
const creatToken = require("../utils/createToken");
const User = require("../models/userModel");

//upload image
exports.uploadUserImage = uploadSingleImage("profileImg");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    req.body.profileImg = filename;
  }
  next();
});

//@desc    Get list of users
//@rout    GET /api/v1/users
//@access  private
exports.getUsers = factory.getAll(User);

//@desc     Get specifc user by id
//@rout     GET /api/v1/users/:id
//@access   private
exports.getUser = factory.getOne(User);

//@desc     creat user
//@rout     POST api/v1/users
//@access   private
exports.createUser = factory.createOne(User);

//@desc     update specific user
//@rout     PUT api/v1/users:id
//@access   private
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Create a copy of req.body and remove sensitive fields that shouldn't be updated directly
  const updateData = { ...req.body };

  // Remove fields that shouldn't be updated or need special handling
  delete updateData.passwordConfirm; // Don't save password confirmation

  // Handle phone/mobile field mapping
  if (updateData.mobile) {
    updateData.phone = updateData.mobile;
    delete updateData.mobile;
  }

  const documents = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!documents) {
    return next(new ApiError(`No documents for this id ${req.params.id}`), 404);
  }

  res.status(200).json({ data: documents });
});

exports.ChangeUserPassword = asyncHandler(async (req, res, next) => {
  const documents = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!documents) {
    return next(new ApiError(`No documents for this id ${req.params.id}`), 404);
  }
  res.status(200).json({ data: documents });
});

//@desc     delet specific user
//@rout     DELET api/v1/users:id
//@access   private
exports.deleteUser = factory.deleteOne(User);

//@desc     Get logged user data
//@rout     GET /api/v1/users/getMe
//@access   private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//@desc     update logged user password
//@rout     put /api/v1/users/updateMyPassword
//@access   private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //1) update user password based payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  //2)generate token
  const token = creatToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
