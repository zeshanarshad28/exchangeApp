const express = require("express");
const walletControllers = require("../controllers/walletControllers");
const authController = require("../controllers/authControllers");
const router = express.Router();

router.post(
  "/createWallet",
  authController.protect,
  walletControllers.createWallet
);
router.get(
  "/viewWallet/:walletId",
  authController.protect,
  walletControllers.viewWallet
);
module.exports = router;
