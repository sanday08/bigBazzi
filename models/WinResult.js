const mongoose = require("mongoose");

const WinResultSchema = new mongoose.Schema(
  {
    result: String,
    isWinByAdmin: {
      type: Boolean,
      default: false
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
    x: Number,
    createDate: {
      type: String,
      default: () =>
        new Date()
          .toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
          })
          .toString(),
    },
    gameName: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("WinResult", WinResultSchema);
