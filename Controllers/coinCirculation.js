const express = require("express");
const router = express.Router();
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
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("========WEB HOOK HITT========");
    // console.log(req.body)
    const sig = req.headers["stripe-signature"];

    let event;
    // let webSigningSecret =process.env.STRIPE_WEBHOOK_SECRET
    let webSigningSecret =
      "whsec_faddf36c52251d00f70e9226be139d5b03938905e35871f512060b9e4053efaa";

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webSigningSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      console.log("in catch blockkkkkkkk#############");
      console.log(`errrrrrrrrrrr msg :${err.message}`);
      console.log(err);

      return;
    }
    const paymentIntent = event.data.object;
    // console.log(event.type);
    // Handle the event
    switch (event.type) {
      case "charge.succeeded":
        // console.log(paymentIntent.metadata)

        console.log("in charge scceeded");
        // add money
        const newAmount = paymentIntent.metadata.newAmount;
        const totalAmount = paymentIntent.metadata.totalAmount;

        const accountNo = paymentIntent.metadata.accountNo;
        const phoneNo = paymentIntent.metadata.phoneNo;
        addMoney();
        // console.log(paymentIntent.user);
        // console.log(paymentIntent);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      case "payment_intent.created":
        console.log("payment intent created 1");
        break;
      case "payment_intent.succeeded":
        console.log("payment intent .succeeded");
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

// creating payment intent.
router.post(
  "/create-payment-intent/:id",
  authControllers.protect,
  async (req, res, next) => {
    if (req.user.allowedToBuy == false) {
      return next(new AppError("You're not allowed to buy coin"));
    }
    const coin = await Coin.findOne({ name: req.body.coinName });
    if (!coin) {
      return next(new AppError(`${req.body.coinName} not exist`, 401));
    }
    if (coin.allowedToBuy == false) {
      return next(new AppError("Coin is restrited to purchase", 401));
    }

    let paymentIntent = await stripe.paymentIntents.create({
      payment_method: req.params.id, // payment mehtod id
      amount: req.body.amount,
      currency: "usd",
      metadata: {
        accountNo: req.body.accountNo,
        webSigningSecret: req.body.webSigningSecret,
        newAmount,
        phoneNo,
        totalAmount,
      },
    });
    res.status(200).json({
      status: "success",
      paymentIntent,
    });
  }
);

module.exports = router;
