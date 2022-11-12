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

module.exports = router;
