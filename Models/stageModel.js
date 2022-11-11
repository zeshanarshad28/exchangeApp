const mongoose = require("mongoose");

const AppErr = require("../utils/appError");
const stageSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: [true, "Please enter name of stage"],
      trim: true,
    },

    stageNumber: {
      type: Number,
    },
    coinId: {
      type: mongoose.Schema.ObjectId,
      ref: "coins",
      required: [true, "please give coin Id "],
    },
    type: {
      type: String,
      required: [true, "Please enter type of stage (eg; public , private"],
    },
    supply: {
      type: Number,
      required: [true, "please add supply to this stage"],
    },
    remainingSupply: {
      type: Number,
    },
    startDate: {
      type: Date,
      required: [true, "please add start date to this stage"],
    },
    endDate: {
      type: Date,
      required: [true, "please add end date to this stage"],
    },
    bonusPercentage: {
      type: Number,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Stage = mongoose.model("stages", stageSchema);

module.exports = Stage;
