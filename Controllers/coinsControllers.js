let User = require("../models/userModel");
const Coin = require("../models/coinModel");
const Stage = require("../models/stageModel");
const catchAsync = require("../utils/catchAsync");
const Transaction = require("../models/transactionModel");
const Wallet = require("../models/walletModel");
const AppError = require("../utils/appError");
const factory = require("./handlersFactory");
const axios = require("axios");

// Add supported coin
exports.addSupportedCoin = catchAsync(async (req, res, next) => {
  if (req.body.type == "dynamic") {
    var newCoin = await Coin.create({
      name: req.body.name,
      type: req.body.type,
      symbol: req.body.symbol,
      rank: req.body.rank,
      remainingSupply: req.body.totalSupply,
      totalSupply: req.body.totalSupply,
      minPurchase: req.body.minPurchase,
      startingPrice: req.body.startingPrice,
      priceCurrency: req.body.priceCurrency,
      category: req.body.category,
    });
  } else {
    var newCoin = await Coin.create({
      name: req.body.name,
      type: req.body.type,
      symbol: req.body.symbol,
      rank: req.body.rank,
      remainingSupply: req.body.totalSupply,
      totalSupply: req.body.totalSupply,
      minPurchase: req.body.minPurchase,
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
    return next(new AppError(`please add correct "type"(dynamic)`));
  }
  var newCoin = await Coin.create({
    name: req.body.name,
    type: req.body.type,
    symbol: req.body.symbol,
    rank: req.body.rank,
    remainingSupply: req.body.totalSupply,
    totalSupply: req.body.totalSupply,
    minPurchase: req.body.minPurchase,
    startingPrice: req.body.startingPrice,
    priceCurrency: req.body.priceCurrency,
    category: req.body.category,
  });

  res.status(201).json({
    status: "success",
    data: newCoin,
  });
});

// Restrict coin to buy
exports.restrictCoinToBuy = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.params.coinId);
  if (!coin) {
    return next(new AppError("Coin not exist", 401));
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
    return next(new AppError("Coin not exist", 401));
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
    return next(new AppError("Coin not exist", 401));
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
    return next(new AppError("Coin not exist", 401));
  }

  const newCoin = await Coin.findByIdAndUpdate(req.params.coinId, {
    allowedToSwap: true,
  });

  res.status(201).json({
    status: "success",
    message: "Coin allowed to swap",
  });
});

// Create stage of dynamic coin
exports.createStage = catchAsync(async (req, res, next) => {
  const coin = await Coin.findById(req.body.coinId);

  if (!coin) {
    return next(new AppError("invalid coin Id", 401));
  }
  if (coin.type == "non-dynamic") {
    return next(new AppError("You cann't make stage of non-dynamic coin ! "));
  }
  if (
    await Stage.findOne({
      coinId: req.body.coinId,
      stageName: req.body.stageName,
    })
  ) {
    return next(new AppError("Stage with this name already exist", 401));
  }
  if (
    await Stage.findOne({
      coinId: req.body.coinId,
      stageNumber: req.body.stageNumber,
    })
  ) {
    return next(
      new AppError("Stage with this stage Number already exist", 401)
    );
  }
  const stage = await Stage.create({
    stageName: req.body.stageName,
    stageNumber: req.body.stageNumber,
    coinId: req.body.coinId,
    userId: req.user._id,
    type: req.body.type,
    supply: req.body.supply,
    remainingSupply: req.body.supply,
    rate: req.body.rate,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    bonusPercentage: req.body.bonusPercentage,
    minPurchase: req.body.minPurchase,
  });
  res.status(201).json({
    status: "success",
    stage,
  });
});

// Update stage of  coin
exports.updateStage = catchAsync(async (req, res, next) => {
  //   console.log(2);

  const coinStage = await Stage.findById(req.params.stageId);

  if (!coinStage) {
    // console.log(2);
    return next(new AppError("invalid coin stage Id", 401));
  }
  //   console.log(coinStage);
  //   console.log(3);

  const currentStageName = await Stage.findOne({
    id: req.params.stageId,
    stageName: req.body.stageName,
  });
  //   console.log(4);

  //   console.log(currentStageName);
  const currentStageNumber = await Stage.findOne({
    id: req.params.stageId,
    stageNumber: req.body.stageNumber,
  });
  //   console.log(currentStageName.stageNumber);

  if (currentStageName && coinStage.stageName != req.body.stageName) {
    return next(new AppError("Stage with this name already exist", 401));
  }
  if (currentStageNumber && coinStage.stageNumber != req.body.stageNumber) {
    return next(
      new AppError("Stage with this stage Number already exist", 401)
    );
  }

  const stage = await Stage.findByIdAndUpdate(req.params.stageId, req.body);
  res.status(201).json({
    status: "success",
    stage,
  });
});

// activate stage
exports.activateStage = catchAsync(async (req, res, next) => {
  const coinStage = await Stage.findById(req.params.stageId);

  if (!coinStage) {
    console.log(2);
    return next(new AppError("invalid coin stage Id", 401));
  }

  if (
    await Stage.findOne({
      id: coinStage.coinId,
      active: true,
    })
  ) {
    return next(new AppError("Another stage is active for this coin", 401));
  }

  const updatedStage = await Stage.findByIdAndUpdate(req.params.stageId, {
    active: true,
  });
  res.status(201).json({
    status: "success",
    updatedStage,
  });
});

// De-activate stage
exports.deActivateStage = catchAsync(async (req, res, next) => {
  const coinStage = await Stage.findById(req.params.stageId);
  if (!coinStage) {
    console.log(2);
    return next(new AppError("invalid coin stage Id", 401));
  }
  const updatedStage = await Stage.findByIdAndUpdate(req.params.stageId, {
    active: false,
  });
  res.status(201).json({
    status: "success",
    updatedStage,
  });
});

// View Pending requests for non-dynamic coins
exports.viewAllRequests = catchAsync(async (req, res, next) => {
  const allRequests = await Transaction.find({ status: "pending" });

  res.status(201).json({
    status: "success",
    allRequests,
  });
});

// Approve Request
exports.approveRequest = catchAsync(async (req, res, next) => {
  const request = await Transaction.findOne({
    transactionId: req.params.reqId,
  });
  if (!request) {
    return next(new AppError("Invalid request Id ", 401));
  }
  const approveRequest = await Transaction.findOneAndUpdate(
    {
      transactionId: req.params.reqId,
    },
    {
      status: "completed",
    }
  );
  const coin = await Coin.findById(request.coinId);
  console.log("1- coinnn" + coin);
  const updatedCoin = await Coin.findByIdAndUpdate(request.coinId, {
    remainingSupply: coin.remainingSupply - request.totalCoins,
  });
  console.log("2- Updated coinnn" + updatedCoin);

  const wallet = await Wallet.findById(request.walletId);
  console.log("3- wallet" + wallet);

  const updatedWallet = await Wallet.findOneAndUpdate({
    coinId: request.coinId,
    balance: wallet.balance + request.totalCoins,
  });
  console.log("4- updated wallet" + updatedWallet);

  res.status(201).json({
    status: "success",
    message: "Request approved",
  });
});

// Reject Request
exports.rejectRequest = catchAsync(async (req, res, next) => {
  const request = await Transaction.findOne({
    transactionId: req.params.reqId,
  });
  if (!request) {
    return next(new AppError("Invalid request Id ", 401));
  }
  const approveRequest = await Transaction.findOneAndUpdate(
    {
      transactionId: req.params.reqId,
    },
    {
      status: "rejected",
    }
  );

  res.status(201).json({
    status: "success",
    message: "Request rejected",
  });
});

// User view transaction history
exports.viewTransactionHistory = catchAsync(async (req, res, next) => {
  const history = await Transaction.find({
    userId: req.user._id,
    status: "completed",
  });
  if (!history) {
    return next(new AppError("Zero transaction", 401));
  }
  res.status(201).json({
    status: "success",
    Transaction_history: history,
  });
});

// Admin view transaction history
exports.viewAllTransactionsHistory = factory.getAll(Transaction);

// Swap coin
exports.swapCoins = catchAsync(async (req, res, next) => {
  if (req.user.allowedToSwap == false) {
    return next(new AppError("You're not allowed to swap coin", 401));
  }

  if (req.user.blocked == true) {
    return next(
      new AppError("You're blocked not allowed to perform any action", 401)
    );
  }
  const coinToSwap = await Coin.findById(req.body.coinToSwapId);
  if (!coinToSwap) {
    return next(
      new AppError(`coin of this ${req.body.coinId} id not exist`, 401)
    );
  }

  const coinToBuy = await Coin.findById(req.body.coinToBuyId);
  if (!coinToBuy) {
    return next(
      new AppError(`coin of this ${req.body.coinId} id not exist`, 401)
    );
  }
  if (coinToBuy.allowedToBuy == false) {
    return next(new AppError("Coin to buy is restrited to purchase", 401));
  }
  if (coinToSwap.allowedToSwap == false) {
    return next(new AppError("Coin is restrited to swap", 401));
  }
  const walletToAdd = await Wallet.findOne({ coinId: coinToBuy.id });
  if (!walletToAdd) {
    const walletToAdd = await Wallet.create({
      name: "un named wallet",
      userId: req.user._id,
      coinId: coinToBuy.id,
    });
  }
  if (walletToAdd.userId.equals(req.user._id)) {
    console.log("authorized user");
  } else {
    return next(
      new AppError(
        "You are not authorized to access this wallet to add coins",
        401
      )
    );
  }
  const walletToRemoveCoin = await Wallet.findOne({ coinId: coinToSwap.id });
  if (!walletToRemoveCoin) {
    return next(
      new AppError("Wallet from which we want to sale/swap is not exist", 401)
    );
  }
  if (walletToRemoveCoin.userId.equals(req.user._id)) {
    console.log("authorized user");
  } else {
    return next(
      new AppError(
        "You are not authorized to access this wallet to remove coins",
        401
      )
    );
  }
  var priceOfCoinToSwap;
  var bonusPercentageOfCoinToSwap = 0;
  var minPurchaseOfCoinToSwap;
  var remainingSupplyOfCoinToSwap;
  if (coinToSwap.type == "dynamic") {
    var coinStageToSwap = await Stage.findOne({
      coinId: coinToSwap._id,
      active: true,
      userId: req.user._id,
    });
    if (!coinStageToSwap) {
      return next(
        new AppError(
          "no stage is active for selling  coin , so price information not found we cann't proceed",
          401
        )
      );
    }
    console.log("5)Stage is:" + coinStageToSwap);

    minPurchaseOfCoinToSwap = coinStageToSwap.minPurchase;
    remainingSupplyOfCoinToSwap = coinStageToSwap.remainingSupply;
    priceOfCoinToSwap = coinStageToSwap.rate;
    bonusPercentageOfCoinToSwap = coinStageToSwap.bonusPercentage;
  } else {
    const url =
      "  https://crypto.price.libonomy.ai/v1/cryptocurrency/quotes/latest?symbol=PSIX";
    const apiData = await axios.get(url, {
      params: {},
    });
    priceOfCoinToSwap = apiData.data.data.data.PSIX.quote.USD.price;
    minPurchaseOfCoinToSwap = coinToSwap.minPurchase;
    remainingSupplyOfCoinToSwap = coinToSwap.remainingSupply;
    console.log("price of non dynamic coin is:" + priceOfCoinToSwap);
  }
  // ----------
  var priceOfCoinToBuy;
  var bonusPercentageOfCoinToBuy = 0;
  var minPurchaseOfCoinToBuy;
  var remainingSupplyOfCoinToBuy;
  if (coinToBuy.type == "dynamic") {
    var coinStageToBuy = await Stage.findOne({
      coinId: coinToBuy._id,
      active: true,
      userId: req.user._id,
    });
    if (!coinStageToBuy) {
      return next(
        new AppError(
          "no stage is active for buying  coin , so price information not found we cann't proceed",
          401
        )
      );
    }
    console.log("5)Stage is:" + coinStageToBuy);

    minPurchaseOfCoinToBuy = coinStageToBuy.minPurchase;
    remainingSupplyOfCoinToBuy = coinStageToBuy.remainingSupply;
    priceOfCoinToBuy = coinStageToBuy.rate;
    bonusPercentageOfCoinToBuy = coinStageToBuy.bonusPercentage;
  } else {
    const url =
      "  https://crypto.price.libonomy.ai/v1/cryptocurrency/quotes/latest?symbol=PSIX";
    const apiData = await axios.get(url, {
      params: {},
    });
    priceOfCoinToBuy = apiData.data.data.data.PSIX.quote.USD.price;
    minPurchaseOfCoinToBuy = coinToSwap.minPurchase;
    remainingSupplyOfCoinToBuy = coinToSwap.remainingSupply;
    console.log("price of non dynamic coin is:" + priceOfCoinToSwap);
  }
  var totalAmountGetBySale = req.body.coinsToSwap * priceOfCoinToSwap;
  var totalCoinsToBuy =
    totalAmountGetBySale / priceOfCoinToBuy +
    (totalAmountGetBySale / priceOfCoinToBuy / 100) *
      bonusPercentageOfCoinToBuy;
  console.log("Total coins to buy=========" + totalCoinsToBuy);
  if (coinToBuy.type == "non-dynamic") {
    console.log("rrrrrrrr" + coinToBuy.remainingSupply);
    if (coinToBuy.remainingSupply < totalCoinsToBuy) {
      return next(
        new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
      );
    }
    if (coinToBuy.minPurchase > totalCoinsToBuy) {
      return next(
        new AppError(
          `You cann't buy less than ${coinToBuy.minPurchase} coins`,
          401
        )
      );
    }
  } else {
    if (coinStageToBuy.remainingSupply < totalCoinsToBuy) {
      return next(
        new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
      );
    }
    if (coinToBuy.remainingSupply < totalCoinsToBuy) {
      return next(
        new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
      );
    }
    if (coinStageToBuy.minPurchase > totalCoinsToBuy) {
      return next(
        new AppError(
          `You cann't buy less than ${coinToBuy.minPurchase} coins`,
          401
        )
      );
    }
  }
  // --------
  var walletToSwap = await Wallet.findOne({
    userId: req.user._id,
    coinId: req.body.coinToSwapId,
  });
  if (!walletToSwap) {
    return next(new AppError("Wallet by which to swap is not found", 401));
  }
  var availableBalance = walletToSwap.balance;
  if (availableBalance < req.body.coinsToSwap) {
    return next(
      new AppError(
        `${req.body.coinsToSwap} coins are not available in your wallet`,
        401
      )
    );
  }
  const updatedWalletToBuy = await Wallet.findOneAndUpdate(
    {
      userId: req.user._id,
      coinId: req.body.coinToBuyId,
    },
    {
      balance: walletToAdd.balance + totalCoinsToBuy,
    }
  );
  console.log("updated wallet::" + updatedWalletToBuy);

  const newTransactionForBuy = await Transaction.create({
    userId: req.user._id,
    walletId: walletToAdd.id,
    coinId: req.body.coinToBuyId,
    transactionType: "buy",
    status: "completed",
    totalCoins: totalCoinsToBuy,
    price: priceOfCoinToBuy,
  });
  console.log("Transaction::" + newTransactionForBuy);

  const updatedWalletToSale = await Wallet.findOneAndUpdate(
    {
      userId: req.user._id,
      coinId: req.body.coinToSwapId,
    },
    {
      balance: walletToSwap.balance - req.body.coinsToSwap,
    }
  );
  console.log("updated wallet::" + updatedWalletToSale);

  const newTransactionForSale = await Transaction.create({
    userId: req.user._id,
    walletId: walletToSwap.id,
    coinId: req.body.coinToSwapId,
    transactionType: "sale",
    status: "completed",
    totalCoins: req.body.coinsToSwap,
    price: priceOfCoinToSwap,
  });
  console.log("Transaction::" + newTransactionForSale);

  const updatedCoinToSwap = await Coin.findByIdAndUpdate(
    req.body.coinToSwapId,
    {
      remainingSupply: coinToSwap.remainingSupply + req.body.coinsToSwap,
    }
  );
  const updatedCoinToBuy = await Coin.findByIdAndUpdate(req.body.coinToBuyId, {
    remainingSupply: coinToBuy.remainingSupply - totalCoinsToBuy,
  });
  res.status(201).json({
    status: "success",
    message: "Coins Swaped",
  });
});
