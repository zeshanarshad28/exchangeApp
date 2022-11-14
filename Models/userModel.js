const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const AppErr = require("../utils/appError");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "must enter email"],
      //   lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      required: [true, "must enter password"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords not matched",
      },
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Enter valid role ",
      },
      default: "user",
    },
    CNICNo: {
      type: Number,
      // minlength: 13,
      // maxlength: 13,
      required: true,
      unique: true,
      validate: {
        validator: function (val) {
          return val.toString().length === 13;
        },
        message: (val) => `${val.value} has to be 13 digits`,
      },
    },
    allowedToBuy: {
      type: Boolean,
      default: true,
    },
    allowedToSwap: {
      type: Boolean,
      default: true,
    },

    twoStepAuthOn: {
      type: Boolean,
      default: false,
    },
    authToken: {
      type: String,
      default: null,
    },
    authTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  //only run this function if password id actually modified
  if (!this.isModified("password")) return next();
  // password validation using Regex
  // var passwordPattern = /^[A-Za-z]\w{7,14}$/;
  var passwordPattern =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{5,14}$/;
  if (!this.password.match(passwordPattern)) {
    next(
      new AppErr(
        "Password is invalid! it should be atleast 8 characters,start with character and contains symbols."
      )
    );
  }
  // Hash the password with cost
  this.password = await bcrypt.hash(this.password, 12);
  // remove(stop) the confirmPassword to store in db. require means necessary to input not to save in db.
  this.confirmPassword = undefined;
  next();
});
// // // ===== Hash Auth Token

// userSchema.pre("save", async function (next) {
//   // if (!this.isModified("authToken")) return next();

//   console.log("in hashing");
//   // Hash the token
//   if (req.body.authToken) {
//     this.authToken = await bcrypt.hash(this.authToken, 12);
//   }
//   console.log(this.authToken);
//   next();
// });

// password Tester
userSchema.methods.correctPassword = async function (
  passwordByUser,
  passwordInDb
) {
  return await bcrypt.compare(passwordByUser, passwordInDb);
};

// ========method to protect routes verifies all about token

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.creatPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// update "passwordChangedAt value in DB whenever we update password "
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //here -1000 mili seconds is to make sure that it will not creat any problem in login as some times that gets this
  next();
});

// Middleware to only get active=true users
userSchema.pre(/^find/, function (next) {
  // here "this" points to the current property`
  this.find({ active: true });
  next();
});

// module.exports = mongoose.models.users || mongoose.model("users", userSchema);

const User = mongoose.model("users", userSchema);

module.exports = User;
