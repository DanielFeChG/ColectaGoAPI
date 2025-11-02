const express = require("express");
const router = express.Router(); //manejador de rutas de express para manejarlas
const investmentSchema = require("../models/investmentModel"); //Ruta del modelo de inversión
const paymentSchema = require("../models/paymentModel"); //Ruta del modelo de pagos
const Campaign = require("../models/campaignModel"); //Ruta del modelo de campaña
const User = require("../models/userModel");

router.post("/payments/:investmentId", async (req, res) => {
  try {
    const { investmentId } = req.params;

    const { provider } = req.body;

    //Validaciones que indican si todos los campos fueron diligenciados
    if (!provider) {
      return res.json({ ok: false, message: "Falta la pasarela de pagos" });
    } 

    //Se obtiene la campaña y el inversionista
    const investment = await investmentSchema.findById(investmentId).select("campaign investor amount").lean();

    //Validación que la inversión exista
    if (!investment) {
      return res.json({ ok: false, message: "Inversión no encontrada" });
    }

    //Se crea el pago
    const created = await paymentSchema.create(
        [{ provider, investment: investmentId, amount: investment.amount }]
    );
    
    const [campaignDoc, investorDoc] = await Promise.all([
        Campaign.findById(investment.campaign).select("campaignName collected").lean(),
        User.findById(investment.investor).select("userName investedAmount").lean(),
    ]);

    const campaignName = campaignDoc.campaignName;
    const investorName = investorDoc.userName;

    return res.json({
        ok: true,
        message: "Pago registrado",
        payment: created,
        campaign: {
            id: campaignDoc._id,
            name: campaignName,
            collected: campaignDoc.collected,
    },
        investor: {
            id: investorDoc._id,
            name: investorName,
            investedAmount: investorDoc.investedAmount,
        }
    })
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todos los pagos discriminado por inversion (para usuario administrador)
router.get("/payments/all", async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el ID del administrador" });//Se valida que se haya ingresado el ID del administrador
    }
    
    const payments = await paymentSchema
        .find()
        .populate({
            path: "investment", // Relación con la inversión
            populate: [
            { path: "campaign", select: "campaignName activeOrInactive owner" }, //Campaña asociada
            { path: "investor", select: "userName mail" }, //Inversionista asociado
            ],
        })
        .lean();

    res.json({ ok: true, total: payments.length, payments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

router.put("/payments/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    if (!paymentId) {
      return res.json({ ok: false, message: "Falta el ID del pago" });//Se valida que se haya ingresado el ID del pago
    }

    const validStatus = ["iniciado", "pagoPendiente", "confirmado", "fallido", "reembolsado"];
    if (status && !validStatus.includes(status)) {
      return res.json({ ok: false, message: `Estado inválido. Usa: ${validStatus.join(", ")}` });//Se valida que el estado a colocar esté en el listado
    }

    const payment = await paymentSchema.findById(paymentId).select("status investment amount").lean();//Se obtiene el estado, la inversión y monto del esquema de pagos

    if (!payment) {
        return res.json({ ok: false, message: "Pago no encontrado" });
    }

    const investment = await investmentSchema.findById(payment.investment).select("campaign investor amount").lean();//Se obtiene la campaña, el inversionista y monto del esquema inversion

    if (!investment) {
        return res.json({ ok: false, message: "Inversión no encontrada" });
    }

    //Si el estado cambió, se actualiza la inversión
    if (status == "pagoPendiente") {
      await investmentSchema.findByIdAndUpdate(
        payment.investment,
        { status: "pagoPendiente" },
        { new: true }
      );
    } else if (status == "confirmado") {
        await investmentSchema.findByIdAndUpdate(
            investment,
            { status: "confirmado" },
            { new: true }
        );
        //Se suma el monto a campaña
        await Campaign.updateOne(
            { _id: investment.campaign },
            { $inc: { "collected": investment.amount } }
        );
        //Se suma el monto al inversionista
        await User.updateOne(
            { _id: investment.investor },
            { $inc: { "investedAmount": investment.amount } }
        );
    } else if (status == "fallido") {
      await investmentSchema.findByIdAndUpdate(
        payment.investment,
        { status: "fallido" },
        { new: true }
      );
    } else if (status == "reembolsado") {
      await investmentSchema.findByIdAndUpdate(
        payment.investment,
        { status: "reembolsado" },
        { new: true }
      );
    } 

    res.json({ ok: true, payment });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

router.delete("/deletePayments/:paymentId", async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el ID del administrador" });//Se valida que se haya ingresado el ID del usuario
    }

    const user = await User.findById(adminId);
    if (!user) return res.json({ ok: false, message: "Usuario no encontrado" });//Se valida que el usuario esté en la BD
    if (user.role !== "administrador") {
      return res.json({ ok: false, message: "Solo los administradores pueden eliminar inversiones" });//Se valida que el ID sea de un administrador
    }

    const { paymentId } = req.params;
    const deleted = await paymentSchema.findByIdAndDelete(paymentId);//Se elimina el pago
    if (!deleted) {
      return res.json({ ok: false, message: "Pago no encontrado" });//Se valida que el pago esté en la BD
    }

    return res.json({ ok: true, message: "Pago eliminado exitosamente" });
  } catch (error) {
    return res.json({ ok: false, message: error.message });
  }
});

module.exports = router;
