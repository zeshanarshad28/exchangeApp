const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlersFactory");
const Wallet = require("../models/walletModel");
const { findById } = require("../models/userModel");

// create wallet
exports.createWallet = catchAsync(async (req, res, next) => {
  const wallet = await Wallet.findOne({
    coinId: req.body.coinId,
    userId: req.user._id,
  });
  if (wallet) {
    return next(new AppError("wallet already exist for this coin", 401));
  }
  const walletByName = await Wallet.findOne({
    name: req.body.name,
    userId: req.user._id,
  });
  if (walletByName) {
    return next(
      new AppError(
        "wallet already exist with this name , Please try another name ",
        401
      )
    );
  }
  const newWallet = await Wallet.create({
    name: req.body.name,
    userId: req.user._id,
    coinId: req.body.coinId,
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
    return next(new AppError("Invalid wallet id ", 401));
  }
  //   console.log("requested user:" + req.user);
  if (walletDetails.userId.equals(req.user._id)) {
    return res.status(200).json({
      status: "success",
      walletDetails,
    });
  }
  return next(new AppError("You're not authorized to view this wallet"));
});
