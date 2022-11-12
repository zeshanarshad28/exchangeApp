const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlersFactory");
const Wallet = require("../models/walletModel");
const { findById } = require("../models/userModel");

// create wallet
exports.createWallet = catchAsync(async (req, res, next) => {
  const newWallet = await Wallet.create({
    name: req.body.name,
    userId: req.user._id,
    coinId: null,
    balance: null,
  });
  res.status(200).json({
    status: "success",
    data: newWallet,
  });
});

// View wallet
exports.viewWallet = catchAsync(async (req, res, next) => {
  //   console.log("in view wallet");
  const walletDetails = await Wallet.findById(req.params.walletId);
  console.log(walletDetails);
  if (!walletDetails) {
    // console.log("wallet not found");
    next(new AppError("Invalid wallet id ", 401));
  }
  //   console.log("requested user:" + req.user);
  if (walletDetails.userId.equals(req.user._id)) {
    return res.status(200).json({
      status: "success",
      walletDetails,
    });
  }
  next(new AppError("You're not authorized to view this wallet"));
});
