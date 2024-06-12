const joi = require("joi");

const validateLoginUser = (req, res, next) => {
  const { email, password } = req.body;

  const validateObject = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
  });
  const validationResult = validateObject.validate({ email, password });
  if (validationResult.error)
    return res.status(400).json({
      message: "Error validating the request",
      data: null,
      errors: validationResult.error.message,
    });
  next();
};

const validateRegister = (req, res, next) => {
  const { firstName, lastName, password, passwordConfirm, email } = req.body;
  const validateObject = joi.object({
    firstName: joi.string().max(30).required(),
    lastName: joi.string().required().max(30),
    password: joi.string().min(8).required(),
    passwordConfirm: joi.string().min(8).required(),
    email: joi.string().email(),
  });

  const validationResult = validateObject.validate({
    firstName,
    lastName,
    password,
    passwordConfirm,
    email,
  });

  if (validationResult.error)
    return res.status(400).json({
      message: "Error validating the body of the request",
      data: null,
      errors: validationResult.error.message,
    });
  next();
};


module.exports = {validateLoginUser, validateRegister}
