const mongoose = require("mongoose");

const AppErr = require("../utils/appError");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
      trim: true,
    },

    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const User = mongoose.model("users", userSchema);

module.exports = User;
