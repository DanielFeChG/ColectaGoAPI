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
    }
}, { timestamps: true });//permite guardar la fecha de creación y actualización automáticamente

//Referencia virtual para visualizar la relación con Payment
investmentSchema.virtual("payments", {
  ref: "Payment",
  localField: "_id",
  foreignField: "investment",
});

//para que el virtual aparezca en JSON
investmentSchema.set("toJSON", { virtuals: true });
investmentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Investment", investmentSchema);
