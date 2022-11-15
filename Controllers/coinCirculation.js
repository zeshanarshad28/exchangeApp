const express = require("express");
const router = express.Router();
const axios = require("axios");
const authControllers = require("./authControllers");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const Coin = require("../models/coinModel");
const Stage = require("../models/stageModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (req, res) => {
//     console.log("========WEB HOOK HITT========");
//     // console.log(req.body);
//     const sig = req.headers["stripe-signature"];

//     let event;
//     // let webSigningSecret =process.env.STRIPE_WEBHOOK_SECRET
//     let webSigningSecret =
//       "whsec_faddf36c52251d00f70e9226be139d5b03938905e35871f512060b9e4053efaa";

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, webSigningSecret);
//     } catch (err) {
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       console.log("in catch blockkkkkkkk#############");
//       console.log(`errrrrrrrrrrr msg :${err.message}`);
//       console.log(err);

//       return;
//     }
//     const paymentIntent = event.data.object;
//     console.log("eveeeeent type" + event.type);
//     // Handle the event
//     switch (event.type) {
//       case "charge.succeeded":
//         // console.log(paymentIntent.metadata)

//         console.log("in charge scceeded");
//         // add money
//         const newAmount = paymentIntent.metadata.newAmount;
//         const totalAmount = paymentIntent.metadata.totalAmount;

//         const accountNo = paymentIntent.metadata.accountNo;
//         const phoneNo = paymentIntent.metadata.phoneNo;
//         addMoney();
//         // console.log(paymentIntent.user);
//         // console.log(paymentIntent);
//         // Then define and call a function to handle the event payment_intent.succeeded
//         break;
//       case "payment_intent.created":
//         console.log("payment intent created 1");
//         break;
//       case "payment_intent.succeeded":
//         console.log("payment intent .succeeded");
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     res.send();
//   }
// );

// creating payment intent.
router.post(
  "/create-payment-intent/:id",
  authControllers.protect,
  async (req, res, next) => {
    // console.log("1)user id" + req.user);
    if (req.user.allowedToBuy == false) {
      return next(new AppError("You're not allowed to buy coin", 401));
    }

    if (req.user.blocked == true) {
      return next(
        new AppError("You're blocked not allowed to perform any action", 401)
      );
    }
    const coin = await Coin.findById(req.body.coinId);
    if (!coin) {
      return next(
        new AppError(`coin of this ${req.body.coinId} id not exist`, 401)
      );
    }
    // console.log("2) coins" + coin);

    if (coin.allowedToBuy == false) {
      return next(new AppError("Coin is restrited to purchase", 401));
    }
    const wallet = await Wallet.findOne({
      userId: req.user._id,
      coinId: coin.id,
    });
    var myWalletId;
    if (wallet) {
      myWalletId = wallet.id;
      console.log("3)Wallet is:" + wallet);
      if (req.user._id.equals(wallet.userId)) {
        console.log("wallet belongs to loged-in user");
      } else {
        return next(new AppError("This wallet is not belongs to you", 401));
      }
    }
    if (!wallet) {
      const newWallet = await Wallet.create({
        name: "un named wallet",
        userId: req.user._id,
        coinId: null,
      });
      myWalletId = newWallet._id;
      console.log("4)Wallet is:" + newWallet);

      console.log("wallet id is" + myWalletId);
    }

    var priceOfCoin;
    var bonusPercentage = 0;
    var minPurchase;
    var remainingSupply;

    if (coin.type == "non-dynamic") {
      const url =
        "  https://crypto.price.libonomy.ai/v1/cryptocurrency/quotes/latest?symbol=PSIX";
      const apiData = await axios.get(url, {
        params: {},
      });
      priceOfCoin = apiData.data.data.data.PSIX.quote.USD.price;
      minPurchase = coin.minPurchase;
      remainingSupply = coin.remainingSupply;
      console.log("price of non dynamic coin is:" + priceOfCoin);
    } else {
      var coinStage = await Stage.findOne({
        coinId: coin._id,
        active: true,
        userId: req.user._id,
      });
      if (!coinStage) {
        return next(
          new AppError(
            "no stage is active for this coin , so price information not found we cann't proceed",
            401
          )
        );
      }
      console.log("5)Stage is:" + coinStage);

      minPurchase = coinStage.minPurchase;
      remainingSupply = coinStage.remainingSupply;
      priceOfCoin = coinStage.rate;
      bonusPercentage = coinStage.bonusPercentage;
    }
    let totalCoinsByAmount = req.body.amount / priceOfCoin;
    console.log("6)Total coins by amount:" + totalCoinsByAmount);

    let totalCoinsToBuy =
      totalCoinsByAmount + (totalCoinsByAmount / 100) * bonusPercentage;
    console.log("total coins to buy" + totalCoinsToBuy);
    if (coin.type == "non-dynamic") {
      console.log("rrrrrrrr" + coin.remainingSupply);
      if (coin.remainingSupply < totalCoinsToBuy) {
        return next(
          new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
        );
      }
      if (coin.minPurchase > totalCoinsToBuy) {
        return next(
          new AppError(
            `You cann't buy less than ${coin.minPurchase} coins`,
            401
          )
        );
      }
    } else {
      if (coinStage.remainingSupply < totalCoinsToBuy) {
        return next(
          new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
        );
      }
      if (coin.remainingSupply < totalCoinsToBuy) {
        return next(
          new AppError(`${totalCoinsToBuy} coins are not available!`, 401)
        );
      }
      if (coinStage.minPurchase > totalCoinsToBuy) {
        return next(
          new AppError(
            `You cann't buy less than ${coin.minPurchase} coins`,
            401
          )
        );
      }
    }
    if (coin.type == "non-dynamic") {
      var paymentIntent = await stripe.paymentIntents.create({
        payment_method: req.params.id, // payment mehtod id
        amount: req.body.amount * 100,
        currency: "usd",

        metadata: {
          totalCoinsToBuy,
          userId: req.user.id,
          walletId: myWalletId,
          coinId: req.body.coinId,
          coinType: coin.type,
          amount: priceOfCoin,
        },
      });
    } else {
      var paymentIntent = await stripe.paymentIntents.create({
        payment_method: req.params.id, // payment mehtod id
        amount: req.body.amount * 100,
        currency: "usd",

        metadata: {
          totalCoinsToBuy,
          userId: req.user.id,
          walletId: myWalletId,
          coinId: req.body.coinId,
          coinType: coin.type,
          stageId: coinStage.id,
          amount: req.body.amount,
        },
      });
    }

    res.status(200).json({
      status: "success",
      paymentIntent,
    });
  }
);

module.exports = router;
