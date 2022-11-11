const express = require("express");
const userController = require("../controllers/userControllers");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/loginWithAuth", authController.loginWithAuth);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

// router.use(authController.restrictTo("admin"));

router
  .route("/getAllUsers")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

router.get(
  "/getSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getUser
);
router.patch(
  "/updateSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUser
);
router.delete(
  "/deleteSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);
router.patch("/turnOnAuth", authController.protect, userController.turnOnAuth);
router.patch(
  "/turnOffAuth",
  authController.protect,
  userController.turnOffAuth
);
router.patch(
  "/makeAdmin/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.makeAdmin
);
router.patch(
  "/makeUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.makeUser
);
router.patch(
  "/restrictToSwap/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restrictToSwap
);
router.patch(
  "/allowToSwap/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.allowToSwap
);
router.patch(
  "/restrictToBuy/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restrictToBuy
);
router.patch(
  "/allowToBuy/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.allowToBuy
);

router.patch(
  "/blockUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.blockUser
);
router.patch(
  "/unblockUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.unblockUser
);

module.exports = router;
