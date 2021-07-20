const mongoose = require("mongoose");

const WinningSchema = new mongoose.Schema({
    percent: {
        type: Number,
        default: 0
    }

}, { timestamps: true })
module.exports = mongoose.model("Winning", WinningSchema);