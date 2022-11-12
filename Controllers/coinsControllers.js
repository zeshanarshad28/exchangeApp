let User = require("../models/userModel");
const Coin = require("../models/coinModel");
const Stage = require("../models/stageModel");
const catchAsync = require("../utils/catchAsync");
const Transaction = require("../models/transactionModel");
const Wallet = require("../models/walletModel");
const AppError = require("../utils/appError");
const factory = require("./handlersFactory");

// Add supported coin
exports.addSupportedCoin = catchAsync(async (req, res, next) => {
  if (req.body.type == "dynamic") {
    var newCoin = await Coin.create(req.body);
  } else {
    var newCoin = await Coin.create({
      name: req.body.name,
      type: req.body.type,
      symbol: req.body.symbol,
      rank: req.body.rank,
      totalSupply: req.body.totalSupply,
      startingPrice: null,
      priceCurrency: null,
      category: req.body.category,
    });
  }
  res.status(201).json({
    status: "success",
    data: newCoin,
  });
});

// Add dynamic coin
exports.addDynamicCoin = catchAsync(async (req, res, next) => {
  if (req.body.type !== "dynamic") {
    next(new AppError(`please add correct "type"(dynamic)`));
  }
  var newCoin = await Coin.create(req.body);

  res.status(201).json({
    status: "success",
    data: newCoin,
  });
});

// Restrict coin to buy
exports.restrictCoinToBuy = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.params.coinId);
  if (!coin) {
    next(new AppError("Coin not exist", 401));
  }
  const newCoin = await Coin.findByIdAndUpdate(req.params.coinId, {
    allowedToBuy: false,
  });

  res.status(201).json({
    status: "success",
    message: "Coin restricted to buy",
  });
});
// Allow coin to buy
exports.allowCoinToBuy = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.params.coinId);
  if (!coin) {
    next(new AppError("Coin not exist", 401));
  }
  const newCoin = await Coin.findByIdAndUpdate(req.params.coinId, {
    allowedToBuy: true,
  });

  res.status(201).json({
    status: "success",
    message: "Coin allowed to buy",
  });
});

// Restrict coin to Swap
exports.restrictCoinToSwap = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.params.coinId);
  if (!coin) {
    next(new AppError("Coin not exist", 401));
  }
  const newCoin = await Coin.findByIdAndUpdate(req.params.coinId, {
    allowedToSwap: false,
  });

  res.status(201).json({
    status: "success",
    message: "Coin restricted to swap",
  });
});
// Allow coin to Swap
exports.allowCoinToSwap = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.params.coinId);
  if (!coin) {
    next(new AppError("Coin not exist", 401));
  }

  const newCoin = await Coin.findByIdAndUpdate(req.params.coinId, {
    allowedToSwap: true,
  });

  res.status(201).json({
    status: "success",
    message: "Coin allowed to swap",
  });
});
