const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const User = require("./userModel");


const investorSchema = new mongoose.Schema({
     balance: {
        type: {
            amount: { type: Number, default: 0 },
            currency: { type: String, default: "USD" },
        },
        required: true
    },

    investedAmount: {
        type: {
            total: { type: Number, default: 0 },
            currency: { type: String, default: "USD" },
        },
        required: true
    },

    investmentCount: {
        type: {
            total: { type: Number, default: 0 },
        },
        required: true
    },

    inversiones: {
        type: [{
            investmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Investment" },
            investedAmount: { type: Number, default: 0 },
            date: { type: Date, default: Date.now },
            status: { type: String, default: "active" } // Ej: "active", "completed", "cancelled"
        }],
        required: false
    },

    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        required: false
    }
});

const Investor = User.discriminator("inversionista", investorSchema);
module.exports = Investor;
