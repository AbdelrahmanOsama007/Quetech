const joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../Models/user");
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    const errors = validateRegister({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
    });
    console.log(errors);
    if (errors)
      return res
        .status(400)
        .json({ message: "Erorr validating request body", errors, data: null });

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

const validateRegister = (registerBody) => {
  const validateObject = joi.object({
    firstName: joi.string().max(30).required(),
    lastName: joi.string().required().max(30),
    password: joi.string().min(8).required(),
    passwordConfirm: joi.string().min(8).required(),
    email: joi.string().email(),
  });

  const validationResult = validateObject.validate(registerBody);

  if (validationResult.error) return validationResult.error.details;
  return null;
};

const validateLoginUser = (loginBody) => {
  const validateObject = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const validationResult = validateObject.validate(loginBody);

  if (validationResult.error) return validationResult.error.details;
  return null;
};

var loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validateLoginUser({ email, password });

    if (validateLoginUser({ email, password }))
      return res
        .json(400)
        .json({ message: "Error validating body", errors, data: null });

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

module.exports = { loginUser, registerUser };
