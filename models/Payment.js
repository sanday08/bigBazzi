const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    toId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    fromId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    creditPoint: {
      type: Number,
      required: true,
    },
    macAddress: {
      type: String,
      required: [true, "Your System is not Verified"],
    },
    status: {
      type: String,
      default: "Pending",
    },
    DrTime: {
      type: String,
      default: () =>
        new Date()
          .toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
          })
          .toString()
          .split(",")[1],
    },
    DrDate: {
      type: String,
      default: () =>
        new Date()
          .toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
          })
          .toString()
          .split(",")[0]
          .replace(/\//g, (x) => "-"),
    },
    createDate: {
      type: String,
      default: () =>
        new Date()
          .toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
          })
          .toString(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
