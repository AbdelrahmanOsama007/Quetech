const joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../Models/user");
const Otp = require("../Models/otp");

const { sendOtpEmail } = require("../utils/sendEmail");
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    const doesExist = await User.findOne({
      where: { email: email },
      attributes: ["id"],
    });

    if (doesExist)
      return res.status(400).json({
        message: "User with this email already exists.",
        errors: null,
        data: null,
      });

    if (password !== passwordConfirm)
      return res
        .status(400)
        .json({ message: "Passwords do not match", data: null, errors: {} });

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create(
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      { returning: true }
    );

    delete user.password;
    res.status(200).json({
      message: "User created successfully",
      data: { user },
      errors: null,
    });
  } catch (error) {
    console.log("Internal Server error");
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", data: null, errors: null });
  }
};

var generateOtp = async (req, res) => {
  try {
    const { id } = req.params;

    var user = await User.findByPk(id, { attributes: ["isValidated"] });

    if (!user)
      return res
        .status(404)
        .json({ message: `User with the following '${id}' does not exist` });

    if (user.isValidated)
      return res.status(400).json({
        message: "User has already been validated",
        data: null,
        errors: null,
      });

    user = await User.findByPk(id, {
      attributes: { exclude: ["*"] },
      include: {
        model: Otp,
        as: "otps",
        limit: 1,
        order: [["createdAt", "desc"]],
      },
    });

    const lastGeneratedOtp = user.otps.length ? user.otps[0] : {};

    if (lastGeneratedOtp) {
      const timeBetween =
        new Date().getTime() - new Date(lastGeneratedOtp.createdAt).getTime();

      if (Math.floor(timeBetween / 1000) <= 60)
        return res.status(400).json({
          message: `An otp has already been issued for the user with the following id '${id}' and is still valid`,
          data: null,
          errors: null,
        });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({
      otp_text: otp,
      userId: id,
    });

    await sendOtpEmail("mohannedahmed15@gmail.com", otp);
    res.status(200).json({
      message: "OTP sent successfully and is valid for 60 seconds",
      data: null,
      errors: null,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", data: null, errors: null });
  }
};

const validateOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp_text } = req.body;

    const user = await User.findByPk(id, { attributes: ["id", "isValidated"] });

    if (!user)
      return res.status(404).json({
        message: `User with the following id '${id}' does not exist`,
        data: null,
        errors: null,
      });

    if (user.isValidated)
      return res.status(400).json({
        message: "User has already been validated",
        data: null,
        errors: null,
      });

    user = await User.findByPk(id, {
      attributes: { exclude: ["*"] },
      include: {
        model: Otp,
        as: "otps",
        limit: 1,
        order: [["createdAt", "desc"]],
      },
    });

    const lastGeneratedOtp = user.otps.length ? user.otps[0] : {};

    if(!lastGeneratedOtp) return res.status(400).json()
  } catch (error) {}
};

var loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: ["password", "email", "id"],
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid Credentials", data: null, errors: null });

    const result = await bcrypt.compare(password, user.password);

    if (!result)
      return res
        .status(400)
        .json({ message: "Invalid Credentials", data: null, errors: null });

    delete user.password;
    res
      .status(200)
      .json({ message: "User logged in", data: { user }, errors: null });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", errors: null, data: null });
  }
};

var viewProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user)
      return res.status(404).json({
        message: `User with the following id '${id}' is not found `,
        data: null,
        errors: null,
      });

    res.status(200).json({
      message: "User found successfully",
      data: { user },
      errors: null,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Internal Server Error",
      data: null,
      errors: { error },
    });
  }
};

var editProfile = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = { loginUser, registerUser, viewProfile, generateOtp };
