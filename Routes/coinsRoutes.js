const express = require("express");
const coinsController = require("../controllers/coinsControllers");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post(
  "/addSupportedCoin",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.addSupportedCoin
);
router.post(
  "/addDynamicCoin",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.addDynamicCoin
);
router.patch(
  "/restrictCoinToBuy/:coinId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.restrictCoinToBuy
);
router.patch(
  "/allowCoinToBuy/:coinId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.allowCoinToBuy
);
router.patch(
  "/restrictCoinToSwap/:coinId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.restrictCoinToSwap
);
router.patch(
  "/allowCoinToSwap/:coinId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.allowCoinToSwap
);
router.post(
  "/createStage",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.createStage
);
router.patch(
  "/updateStage/:stageId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.updateStage
);
router.patch(
  "/activateStage/:stageId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.activateStage
);
router.patch(
  "/deActivateStage/:stageId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.deActivateStage
);
router.get(
  "/viewAllRequests",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.viewAllRequests
);
router.patch(
  "/approveRequest/:reqId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.approveRequest
);
router.patch(
  "/rejectRequest/:reqId",
  authController.protect,
  authController.restrictTo("admin"),
  coinsController.rejectRequest
);
router.get(
  "/viewTransactionHistory",
  authController.protect,

  coinsController.viewTransactionHistory
);
router.get(
  "/viewAllTransactionsHistory",
  authController.protect,
  authController.restrictTo("admin"),

  coinsController.viewAllTransactionsHistory
);
router.patch("/swapCoins", authController.protect, coinsController.swapCoins);
module.exports = router;
