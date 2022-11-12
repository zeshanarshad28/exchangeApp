const mongoose = require("mongoose");

const AppErr = require("../utils/appError");
const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name of wallet"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "please give user's Id "],
    },
    coinId: {
      type: mongoose.Schema.ObjectId,
      ref: "coins",
    },

    balance: {
      type: Number,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Wallet = mongoose.model("wallets", walletSchema);

module.exports = Wallet;
