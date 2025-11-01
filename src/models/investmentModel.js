const mongoose = require("mongoose"); // importando el componente mogoose
const investmentSchema = mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        index: true,
        required: true,
    },
    investor: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ["iniciado", "pagoPendiente", "confirmado", "fallido", "reembolsado"],
        default: "iniciado",
        index: true,
    },
    // payment: { 
    //     type: ObjectId, 
    //     ref: "Payment" 
    // },
});

module.exports = mongoose.model("Investment", investmentSchema);
