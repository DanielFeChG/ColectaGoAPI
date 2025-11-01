const mongoose = require("mongoose"); // importando el componente mogoose
const crypto = require("crypto");
const paymentSchema = mongoose.Schema({
    provider: { 
        type: String,
        enum: ["WOMPI","MERCADO_PAGO","STRIPE"],
        required: true
    },
    providerIntentId: { 
        type: String, 
        default: () => crypto.randomBytes(6).toString("hex"), // genera 12 caracteres hex
        unique: true 
    },   // id de enlace con pasarela
    investment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Investment", 
        index: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["creado","en_proceso","confirmado","fallido","devolucion"], 
        default: "creado", 
        index: true 
    },
}, { timestamps: true });//permite guardar la fecha de creación y actualización automáticamente

module.exports = mongoose.model("Payment", paymentSchema);