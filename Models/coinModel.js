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
        message: "Enter valid type ",
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
    startingPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["coin", "token", "VIP"],
        message: "Enter valid category ( eg; token, coin, VIP) ",
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Coin = mongoose.model("coins", coinSchema);

module.exports = Coin;
