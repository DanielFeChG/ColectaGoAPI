const mongoose = require("mongoose"); // importando el componente mogoose
const campaignSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campaignName: {
        type: String,
        required: true
    },
    crowdfunder: {
        type: String,
        required: true
    },
    crowdfunderNIT: {
        type: String,
        required: true
    },
    articlesOfIncorporation: {
        type: {
            data: Buffer,
            contentType: { type: String, default: "application/pdf" },
            filename: String,
            size: Number,
            uploadedAt: { type: Date, default: Date.now },
        },
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
    collected: {
        type: Number,
        default: 0,
        required: true
    },
    activeOrInactive: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: "inactivo",
        required: true
    },
}, { timestamps: true });//permite guardar la fecha de creación y actualización automáticamente
module.exports = mongoose.model("Campaign", campaignSchema);