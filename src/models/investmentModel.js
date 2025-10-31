const mongoose = require("mongoose"); // importando el componente mogoose
const investmentSchema = mongoose.Schema({
    campaign: {
        type: ObjectId,
        ref: "Campaign",
        index: true,
        required: true,
    },
    investor: { 
        type: ObjectId,
        ref: "User",
        index: true, 
        required: true 
    },
    amount: { 
        type: Schema.Types.Decimal128, 
        required: true 
    },
    status: {
        type: String,
        enum: ["iniciado", "pagoPendiente", "confirmado", "fallido", "reembolsado"],
        default: "iniciado",
        index: true,
    },
    payment: { 
        type: ObjectId, 
        ref: "Payment" 
    },
});

module.exports = mongoose.model("Investment", investmentSchema);
