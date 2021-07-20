const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
    announcement: {
        type: String,
        default: ""
    }

}, { timetamps: true })
module.exports = mongoose.model("Announcement", AnnouncementSchema);