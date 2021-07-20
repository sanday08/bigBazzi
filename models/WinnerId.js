const mongoose = require("mongoose");

const WinnerIdSchema = new mongoose.Schema({
    referralId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: ["retailer", "distributer", "superDistributer"], //if you write admin than its display error "`admin` is not a valid enum value for path `role`".
        default: "retailer",
    },
    percent: {
        type: Number,
        default: 0
    }

}, { timestamps: true })
module.exports = mongoose.model("WinnerId", WinnerIdSchema);