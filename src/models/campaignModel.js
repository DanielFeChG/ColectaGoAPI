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
    documents: {
        type: String,
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