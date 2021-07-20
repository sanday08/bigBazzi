const mongoose = require("mongoose");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  firmName: {
    type: String,
    required: [true, "Please Add FirmName"]
  },

  mobile: {
    type: String,
    maxlength: [10, "Phone number can not be longer than 10 characters"],
  },
  role: {
    type: String,
    enum: ["retailer", "Admin"], //if you write admin than its display error "`admin` is not a valid enum value for path `role`".
    default: "retailer",
  },
  userName: {
    type: String,
    required: [true, "Please add a userName"],


  },
  password: {
    type: String,
    select: false,

  },
  transactionPin: {
    type: Number,
    required: [true, "Please add a transactionPin"],
    minlength: [6, "TransactionPin must be at least 4 characters"],
    maxlength: [6, "TransactionPin must be at least 4 characters"]
  },

  address: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  creditPoint: {
    type: Number,
    default: 0
  },
  // commissionPoint: {
  //   type: Number,
  //   default: 0
  // },
  // commissionPercentage: {
  //   type: Number,
  //   default: 0,
  //   maxlength: 2
  // },
  // sharingPoint: {
  //   type: Number,
  //   default: 0,
  //   maxlength: 2
  // },
  // sharingPercentage: {
  //   type: Number,
  //   default: 0
  // },
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
  
  playPoint: {
    type: Number,
    default: 0
  },
  wonPoint: {
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
