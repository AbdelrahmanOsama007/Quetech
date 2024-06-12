const express = require("express");
const {
  registerUser,
  loginUser,
  generateOtp,
  viewProfile,
} = require("../controller/UserController");
const {
  validateLoginUser,
  validateRegister,
} = require("../middleware/validationMiddlewares");
const userRouter = express.Router();

userRouter.route("/register").post(validateRegister, registerUser);
userRouter.route("/login").post(validateLoginUser, loginUser);
userRouter.route("/generateOtp/:id").post(generateOtp);
userRouter.route("/:id").get(viewProfile);
module.exports = userRouter;
