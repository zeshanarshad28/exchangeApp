const { promisify } = require("util");
const crypto = require("crypto");
let User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email");
const { message } = require("../utils/sms");
const bcrypt = require("bcrypt");
// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };
const signToken = (id) => {
  return jwt.sign({ id }, "qwertyuiopasdfghjklzxcvbnmqwerty", {
    expiresIn: "1d",
  });
};
// ======== function to creat and send token===========
const creatSendToken = (user, statusCode, res) => {
  console.log("in creatSendToken");
  const token = signToken(user._id);
  // defining a cookie -
  const cookieOptions = {
    expires: new Date(
      // Date.now() + process.env.COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
      Date.now() + 1 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie can not modify by browser
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true; // by secure=true cookie only send on encrypted connection like HTTPS
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; /// hide the password to show in response
  console.log(user);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
// =========SIGNUP USER=====================
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    CNICNo: req.body.CNICNo,
    phoneNo: req.body.phoneNo,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  let sendingMail = await new Email(newUser, url).sendWelcome();

  // message(
  //   "Congratulations your account has been created successfully",
  //   req.body.phoneNo
  // );

  creatSendToken(newUser, 201, res);
});
//     ====================LOGIN User without auth=========================================
exports.login = catchAsync(async (req, res, next) => {
  console.log("route hit for login");
  const { email, password } = req.body;
  // check if email and password exist
  if (!email || !password) {
    return next(new AppErr("please provide email and password", 400));
  }
  // check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErr("Incorrect email or password", 401));
  }
  if (user.twoStepAuthOn == true) {
    console.log("sending pin code to number");
    let authToken = Math.floor(100000 + Math.random() * 900000);
    message(`Verification token is:${authToken}.`, user.phoneNo);
    console.log(authToken);
    let authString = authToken.toString();
    let tokenExpiry = Date.now() + 1000 * 60 * 2;
    let hashedToken = await bcrypt.hash(authString, 12);
    let newUser = await User.findOneAndUpdate(
      { email },
      {
        authToken: hashedToken,
        authTokenExpiresAt: tokenExpiry,
      }
    );
    return res.status(200).json({
      status: "success",
      message: "verification token send!",
    });
  }
  console.log("getting login");
  // creat token from existing function .
  creatSendToken(user, 200, res);
});
// ====================LOGIN WITH AUTH===============
exports.loginWithAuth = catchAsync(async (req, res, next) => {
  console.log("in auth login");
  const { email, authToken } = req.body;

  const user = await User.findOne({ email });
  // if (user.authToken != authToken) {
  //   return next(new AppErr("Invalid token", 401));
  // }
  console.log(1);
  if (!(await bcrypt.compare(authToken, user.authToken))) {
    return next(new AppErr("Invalid token", 401));
  }
  console.log(2);

  // if (user.authTokenExpiresAt < Date.now()) {
  //   return next(new AppErr("Token Expired !", 401));
  // }

  console.log("before create send ");
  creatSendToken(user, 200, res);
});
// ===========================VERIFY TOKEN BEFORE GETTING DATA=====================
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if its there
  let token;
  console.log("verifying token....");
  // console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log("token get step 1.");
    // console.log(token);
  }
  console.log(token);
  if (!token) {
    return next(
      new AppErr("You are not logged in , please login to get access", 401)
    );
  }

  // Verification of  token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log("token verified step 2.");
  //3) check if the user still exist
  console.log("after decode", decoded);
  const currentUser = await User.findById(decoded.id);
  console.log(currentUser);
  if (!currentUser) {
    return next(new AppErr("User not exist now", 401));
  }
  // console.log("User exist step 3.");

  //check if the user changed the password after the token is issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppErr("User recently changed password please login again!", 401)
    );
  }
  //grant access to the protected rout
  req.user = currentUser;
  // console.log(currentUser);
  console.log("verification completed");
  next();
});

//================= Authorization=============
//Restrict who can delete tour

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErr("You donot have permission to perform this action ", 403)
      );
    }
    console.log("restrict to passed");
    next();
  };
};

// =================================================================================

// ======== FORGOT PASSWORD AND PASSWORD RESET ================

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log("in forgotPassword");
  // 1) get user on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErr("There is no user with given email adress", 404));
  }
  // 2) generate the random reset token
  const resetToken = user.creatPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to the user email[]
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword`;
  const message = `Forgot your password ? click the URL and reset your password ${resetURL} and the token is: ${resetToken}`;
  try {
    // await Email({
    //   email: user.email,
    //   subject: "your password reset token is valid for 1o minutes",
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset(
      "Passord reset token!!!",
      message
    );
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErr(
        "There was an error while sending email. please try again later",
        500
      )
    );
  }
});

// ===================RESET PASSWORD===============================
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // if the token has not expired and there is a user set the new password

  if (!user) {
    return next(new AppErr("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // update changedPasswordAt property by schema middlware
  //  now  log the user in , send jwt
  //creatSendToken(user, 200, res);
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

// ===========UPDATE PASSWORD for already login user=================================
exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log("in update logged in user ");
  // 1)get user from collection.
  const user = await User.findById(req.user.id).select("+password");

  // check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppErr("Your current password is wrong ", 401));
  }
  // if so update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // Log user in  , send jwt
  creatSendToken(user, 200, res);
});
