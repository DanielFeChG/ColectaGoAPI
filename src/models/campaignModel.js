const mongoose = require("mongoose"); // importando el componente mogoose
const campaignSchema = mongoose.Schema({
    campaignName: {
        type: String,
        required: true
    },
    crowdfounder: {
        type: String,
        required: true
    },
    crowdfounderNIT: {
        type: String,
        required: true
    },
    articlesOfIncorporation: {
        data: Buffer,
        contentType: { type: String, default: "application/pdf" },
        filename: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
        required: true
    },
    campaignObjectives: {
        type: String,
        required: true
    },
    serviceOrProduct: {
        type: String,
        required: true
    },
});
module.exports = mongoose.model("Campaign", campaignSchema);