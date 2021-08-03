const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//@desc    Register a User
//@route   Post /api/auth
//@access  Private
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, referralId, mobile, password, } = req.body;
  //Create User
  const user = await User.create({ name, email, referralId, mobile, password });
  //Create Token
  //   const token = user.getSignedJwtToken();
  //   res.status(200).json({ success: true, token });
  sendTokenResponse(user, 200, res);
});

//@desc     Login user
//@route    Post /api/auth/login
//@access   public

exports.login = asyncHandler(async (req, res, next) => {

  const { userName, password } = req.body;
  //userName and password fields are required
  if (!userName && !password) {
    return next(
      new ErrorResponse("userName and password fields must be required"),
      400
    );
  }
  //Check for user
  const user = await User.findOne({ userName }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }
  //Check if Password matches


  if (user.password != password) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse("Your Account is Blocked Please contact your Admin",))
  }
  sendTokenResponse(user, 200, res);
});


//@desc     Login Retailer only for app
//@route    Post /api/auth/retailer/login
//@access   public

exports.loginAdmin = asyncHandler(async (req, res, next) => {

  const { userName, password } = req.body;
  //userName and password fields are required
  console.log("userName : ", userName, "          password : ", password);
  if (!userName && !password) {
    return next(
      new ErrorResponse("userName and password fields must be required"),
      400
    );
  }
  //Check for user
  const user = await User.findOne({ userName }).select("+password");
  console.log("UserData is ", user);
  if (!user) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }
  if (user.role != "Admin") {
    return next(new ErrorResponse("You are not authorized to access this application.", 401));
  }


  //Check if Password matches


  if (user.password != password) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse("Your Account is Blocked Please contact your Admin",))
  }

  await User.findByIdAndUpdate(user._id, { isLogin: true });
  sendTokenResponse(user, 200, res);
});







//@desc     Login Retailer only for app
//@route    Post /api/auth/retailer/login
//@access   public

exports.loginRetailer = asyncHandler(async (req, res, next) => {

  const { userName, password } = req.body;
  //userName and password fields are required
  console.log("userName : ", userName, "          password : ", password);
  if (!userName && !password) {
    return next(
      new ErrorResponse("userName and password fields must be required"),
      400
    );
  }
  //Check for user
  const user = await User.findOne({ userName }).select("+password");
  console.log("UserData is ", user);
  if (!user) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }
  if (user.role != "retailer") {
    return next(new ErrorResponse("You are not authorized to access this application.", 401));
  }


  //Check if Password matches


  if (user.password != password) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse("Your Account is Blocked Please contact your Admin",))
  }

  await User.findByIdAndUpdate(user._id, { isLogin: true });
  sendTokenResponse(user, 200, res);
});



///@desc    Log user out/ clear cookie
//@route    GET /api/auth/logout/
//@access   Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

///@desc    Log retailer out/ clear cookie
//@route    GET /api/auth/retailerLogout/:id
//@access   Private

exports.logoutRetailer = asyncHandler(async (req, res, next) => {
  console.log(req.params.id)
  await User.findByIdAndUpdate(req.params.id, { isLogin: false });
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});




///@desc     Get current logged in user
//@route    GET /api/auth/me
//@access   private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "referralId",
    select: "userName name -_id"
  });
  res.status(200).json({ success: true, data: user });
});

///@desc     Update user details
//@route    PUT /api/auth/updatedetails
//@access   private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

///@desc     Update Password
//@route    PUT /api/auth/updatepassword
//@access   private

exports.updatePassword = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select("+password");
  //Check current password (matchPassword method defined in User models)
  if (user.password != req.body.currentPassword) {
    next(new ErrorResponse(`Password is incorrect`, 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

///@desc    Forget password
//@route    Post /api/auth/forgetpassword
//@access   public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetpassword/${resetToken}`;
  const message = `You are receiving a email because you (or someone else) has requested the reset of a password. 
  Please make put reqest to:\n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email could not be sent`, 500));
  }

  res.status(200).json({ success: true, data: user });
});

///@desc     Reset Password
//@route    PUT /api/auth/resetpassword/:resettoken
//@access   public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalide Token", 400));
  }
  //Set new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};


///@desc     Update Password
//@route    PUT /api/auth/updateTransactionPin
//@access   private

exports.updateTransactionPin = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select("+password");
  //Check current password (matchPassword method defined in User models)
  if (user.password != req.body.currentPassword || user.transactionPin != req.body.currentTransactionPin) {
    next(new ErrorResponse(`Your Password or TransactionPin is incorrect`, 401));
  }
  user.transactionPin = req.body.newTransactionPin;
  await user.save();
  sendTokenResponse(user, 200, res);
});

//@desc      Get all transactions
//@routes    GET /api/auth/transactions
//Access     Private/Admin
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const users = await Payment.find({ $or: [{ toId: req.user.id }, { fromId: req.user.id }] });
  res.status(200).json({ success: true, data: users });
});


//@desc      Get all Username
//@routes    GET /api/users/userName
//Access     Private/Admin
exports.getUserName = asyncHandler(async (req, res, next) => {
  const users = await User.find({ $where: "/^" + req.body.userName + ".*/.test(this.userName)" })
  console.log(users);
  res.status(200).json({ success: true, data: users });
});
//@desc      Get Single users
//@routes    GET /api/users/:id
//Access     Private/for users
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById({ _id: req.params.id }).populate("name", "userName");
  res.status(200).json({ success: true, data: user });
});