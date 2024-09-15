const Users = require("../../../models/students");
const Class = require("../../../models/classes");
const Wallet = require("../../../models/wallet");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mail = require("../../../services/Mails");
const { Op } = require("sequelize");

module.exports.forget_password = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  let code = Math.floor(Math.random() * 90000) + 10000;

  console.log("..........", user, "/////////////");

  mail(req.body.email, "this is your code : " + code);

  user.time = Date.now();
  console.log("@@#!@#!@#" + user.time);
  user.code = code;

  await user.save((err, updatedUser) => {
    if (err) {
      return res.status(500).send(err);
    }
  });
  return res.status(200).json({
    success: 1,
    message: "Check your email for the code",
  });
};

module.exports.check_code = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.code || !user.time) {
      return res.status(400).send("Code not found or expired");
    }
    console.log("//////////////" + (Date.now() - user.time) + "////////");

    if (req.body.code !== user.code) {
      return res.status(400).send("Invalid code");
    } else if (req.body.code == user.code && Date.now() - user.time > 60000) {
      return res.status(400).send("Code expired");
    } else {
      return res.status(200).json({
        success: 1,
        message: "Code verified successfull",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports.reset_password = async (req, res, next) => {
  try {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!req.body.newPassword) {
      return res.status(400).send("New password is required");
    }

    bcrypt.hash(req.body.newPassword, 12, async (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
      }

      user.password = hash;
      await user.save();

      return res.status(200).json({
        success: 1,
        message: "Password reset successfully",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { name, password, email, phoneNumber, classId } = req.body;

    const wallet = await Wallet.create();

    const wallet_id = wallet.id;
    // Validate phone number format
    if (!/^(09)\d{8}$/.test(phoneNumber)) {
      return res
        .status(400)
        .json({
          message: 'Phone number should start with "09" and be 10 digits long',
        });
    }

    // Check if email already exists
    const existingEmail = await Users.findOne({ where: { email: email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check if phone number already exists
    const existingPhoneNumber = await Users.findOne({
      where: { phoneNumber: phoneNumber },
    });
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is already registered" });
    }

    // Hash the password
    const hashpassword = await bcrypt.hash(password, 12);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const defaultImagePath = `${baseUrl}/defaultImage/accountImage.jpg`;

    // Create the user
    await Users.create({
      name,
      password: hashpassword,
      email,
      phoneNumber,
      classId,
      walletId: wallet_id,
      imagePath: defaultImagePath,
    });
    // Send confirmation email
    mail(email, "You've registered successfully!");

    return res.status(200).json({
      success: 1,
      message: "User registered successfull",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while registering user" });
  }
};

module.exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.findAll({
      where: {
        deleted_at: null,
      },
    });

    res.status(200).json(classes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
};

module.exports.Login = (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    Users.findOne({ where: { email: email } })
      .then((user) => {
        if (!user) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }
        bcrypt.compare(password, user.password).then((doo) => {
          if (!doo) {
            return res
              .status(401)
              .json({ message: "Invalid username or password" });
          }
          const jsontoken = jwt.sign(
            { userID: user.id },
            "L93KjbNwTdR4yvSgEcP6XfM2D7zR8hWq",
            { expiresIn: "1h" }
          );

          return res.status(200).json({
            success: 1,
            message: "Logged in",
            userID: user.id,
            token: jsontoken,
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while logging in" });
  }
};
module.exports.Logout = (req, res, next) => {
  req.headers["authorization"] = undefined;
  return res.status(200).json({
    success: 1,
    message: "Logged out",
  });
};
