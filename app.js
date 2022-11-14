const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

const userRoutes = require("./routes/userRoutes");
const coinRoutes = require("./routes/coinsRoutes");
const walletRoutes = require("./routes/walletRoutes");
const coinCirculation = require("./controllers/coinCirculation");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");
const Coin = require("./models/coinModel");
const Wallet = require("./models/walletModel");
const Stage = require("./models/stageModel");
const Transaction = require("./models/transactionModel");
const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);
const app = express();
app.post(
  "/coinCirculation/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("========WEB HOOK HITT========");
    // console.log(req.body);
    const sig = req.headers["stripe-signature"];
    try {
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
      // console.log("eveeeeent type" + event.type);
      // Handle the event
      switch (event.type) {
        case "charge.succeeded":
          // console.log(paymentIntent.metadata)

          console.log("in charge scceeded");
          // add money
          // const totalCoinsToBuy = paymentIntent.metadata.totalCoinsToBuy;
          // const userId = paymentIntent.metadata.userId;

          // const walletId = paymentIntent.metadata.walletId;
          // const coinId = paymentIntent.metadata.coinId;
          // const coinType = paymentIntent.metadata.coinType;
          // const stageId = paymentIntent.metadata.stageId;

          // Then define and call a function to handle the event payment_intent.succeeded
          break;
        case "payment_intent.created":
          console.log("payment intent created 1");

          break;
        case "payment_intent.succeeded":
          console.log("payment intent .succeeded");
          console.log(paymentIntent.metadata);
          var totalCoinsToBuy = paymentIntent.metadata.totalCoinsToBuy * 1;
          var userId = paymentIntent.metadata.userId;

          var walletId = paymentIntent.metadata.walletId;
          var coinId = paymentIntent.metadata.coinId;
          var coinType = paymentIntent.metadata.coinType;
          var amount = paymentIntent.metadata.amount;

          console.log(typeof totalCoinsToBuy);
          console.log(
            "total coi--------------------------------------------------" +
              totalCoinsToBuy
          );

          // console.log(stageId);
          if (coinType == "dynamic") {
            var stageId = paymentIntent.metadata.stageId;
            console.log("staggggggg id" + stageId);

            try {
              console.log("in try catch block");
              const coin = await Coin.findById(coinId);
              const updatedCoin = await Coin.findByIdAndUpdate(coinId, {
                remainingSupply: coin.remainingSupply - totalCoinsToBuy,
              });
              console.log("stage id......." + stageId);
              console.log("updated coin::" + updatedCoin);
              const stage = await Stage.findById(stageId);
              console.log("stage---------" + stage);
              const updatedStage = await Stage.findByIdAndUpdate(stageId, {
                remainingSupply: stage.remainingSupply - totalCoinsToBuy,
              });
              console.log("updated stage::" + updatedStage);

              const wallet = await Wallet.findById(walletId);
              const updatedWallet = await Wallet.findOneAndUpdate({
                coinId: coinId,
                balance: wallet.balance + totalCoinsToBuy,
              });
              console.log("updated wallet::" + updatedWallet);

              const newTransaction = await Transaction.create({
                userId,
                walletId,
                coinId,
                transactionType: "buy",
                status: "completed",
                totalCoins: totalCoinsToBuy,
                price: amount,
              });
              console.log("Transaction::" + newTransaction);
            } catch (error) {
              console.log("zzzzzzzzzzzzzzzzzzz");
              console.log(error);
            }
          } else {
            try {
              // const coin = await Coin.findById(coinId);
              // console.log("1- coinnn" + coin);
              // const updatedCoin = await Coin.findByIdAndUpdate(coinId, {
              //   remainingSupply: coin.remainingSupply - totalCoinsToBuy,
              // });
              // console.log("2- Updated coinnn" + updatedCoin);

              // const wallet = await Wallet.findById(walletId);
              // console.log("3- wallet" + wallet);

              // const updatedWallet = await Wallet.findOneAndUpdate({
              //   coinId: coinId,
              //   balance: wallet.balance + totalCoinsToBuy,
              // });
              // console.log("4- updated wallet" + updatedWallet);

              const newTransaction = await Transaction.create({
                userId,
                walletId,
                coinId,
                transactionType: "buy",
                status: "pending",
                totalCoins: totalCoinsToBuy,
                price: amount,
              });
              console.log("5- transaction" + newTransaction);
            } catch (error) {
              console.log("in errrrrrrrrrrrrrr");
              console.log(error, error.stack);
            }
          }
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.send();
    } catch (error) {
      console.log("nnnnnnnnnnnnnn" + error);
    }
  }
);
// ===== Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
app.use(xssClean());
//  Set Security HTTP Headers======
app.use(helmet());

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(express.json());
// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/coin", coinRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/coinCirculation", coinCirculation);

// // Handling unhandled routes:
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Error handler middlware
app.use(globalErrorHandler);

module.exports = app;
