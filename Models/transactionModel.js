const mongoose = require("mongoose");

const AppErr = require("../utils/appError");
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: Number,
      default:
        Math.floor(Math.random() * 1000000000000 + 9999999999999) + Date.now(),
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "please give user's Id "],
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    currency: {
      type: String,
      default: "usd",
    },
    walletId: {
      type: mongoose.Schema.ObjectId,
      ref: "wallets",
      required: [true, "please give wallet Id "],
    },
    coinId: {
      type: mongoose.Schema.ObjectId,
      ref: "coins",
      required: [true, "please give coin Id "],
    },
    transactionType: {
      type: String,
      enum: {
        values: ["buy", "sale"],
        message: "Enter valid transaction type ",
      },
    },
    price: {
      type: Number,
    },
    totalCoins: {
      type: Number,
    },
    buySaleWalletId: {
      type: mongoose.Schema.ObjectId,
      ref: "wallets",
    },
    status: {
      type: String,
      enum: {
        values: ["completed", "pending", "rejected"],
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Transaction = mongoose.model("transactions", transactionSchema);

module.exports = Transaction;
