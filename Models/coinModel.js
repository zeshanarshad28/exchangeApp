const mongoose = require("mongoose");

const AppErr = require("../utils/appError");
const coinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the name of coin"],
      trim: true,
      unique: true,
    },

    symbol: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ["dynamic", "non-dynamic"],
        message: "Enter valid type (eg; dynamic or non-dynamic) ",
      },
    },
    rank: {
      type: Number,
      required: true,
      unique: true,
    },
    totalSupply: {
      type: Number,
      required: true,
    },
    remainingSupply: {
      type: Number,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    startingPrice: {
      type: Number,
    },
    priceCurrency: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["coin", "token", "VIP"],
        message: "Enter valid category ( eg; token, coin, VIP) ",
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Coin = mongoose.model("coins", coinSchema);

module.exports = Coin;
