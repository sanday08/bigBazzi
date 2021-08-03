const mongoose = require("mongoose");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  mobile: {
    type: String,
    maxlength: [10, "Phone number can not be longer than 10 characters"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add valid email",
    ],
  },
  role: {
    type: String,
    enum: ["User", "Admin"], //if you write admin than its display error "`admin` is not a valid enum value for path `role`".
    default: "User",
  },

  password: {
    type: String,
    select: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  reffralAmount: {
    type: Number,
    default: 0
  }
  ,
  amount: {
    type: Number,
    default: 0
  },
  uniqCode: {
    type: String,
    default: () => {
      return nanoid();
    }
  },
  referralId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  lastTicketId: {
    type: String,
    default: "000",
  },
  lastBetAmount: {
    type: Number,
    default: 0
  },
  isLogin: {
    type: Boolean,
    default: false
  },

  playAmount: {
    type: Number,
    default: 0
  },
  wonAmount: {
    type: Number,
    default: 0
  },
  permissions: {
    type: Array,
    default: []
  }

  // resetPasswordToken: String,
  // resetPasswordExpire: Date, 

}, { timestamps: true });
//Encrypt password us bcrypt
// UserSchema.pre("save", async function () {
//   //this condition used when forgot password
//   if (!this.isModified("password")) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role, userName: this.userName, creditPoint: this.creditPoint, name: this.name, transactionPin: this.transactionPin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// //Match user entered password and hash password in database
// UserSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// //Genrate and hash password token
// UserSchema.methods.getResetPasswordToken = function () {
//   //Genrate Token
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   //Hask token and set to resetPasswordToken field
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   //Set expire
//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 minutes
//   return resetToken;
// };
module.exports = mongoose.model("User", UserSchema);
