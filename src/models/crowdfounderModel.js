const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const User = require("./userModel");


const crowdfounderSchema = new mongoose.Schema({
    bio: {
        type: String,
        required: false,
    },
    organization: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: false
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    followers: {
        type: Number,
        default: 0
    },
    campaigns: [
        {
            type: Types.ObjectId,
            ref: "Campaign",
        }
    ]
});

const Crowdfounder = User.discriminator("crowdfounder", crowdfounderSchema);
module.exports = Crowdfounder;
