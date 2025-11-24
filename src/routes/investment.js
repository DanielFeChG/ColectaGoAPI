const express = require("express");
const router = express.Router(); //manejador de rutas de express para manejarlas
const User = require("../models/userModel");
const investmentSchema = require("../models/investmentModel"); //Ruta del modelo de inversión
const Campaign = require("../models/campaignModel"); //Ruta del modelo de campaña
require("../models/paymentModel");//Ruta del modelo de pagos

router.post("/invest", async (req, res) => {
  try {
    const { campaign, investor, amount } = req.body;

    //Validaciones que indican si todos los campos fueron diligenciados
    if (!campaign) {
      return res.json({ ok: false, message: "Falta el ID de la campaña" });
    } else if (!investor) {
      return res.json({ ok: false, message: "Falta el ID del inversionista" });
    } else if (!amount) {
      return res.json({ ok: false, message: "Falta el monto a invertir" });
    }

    const user = await User.findById(investor);
    if (!user) {
      return res.json({ ok: false, message: "Usuario no encontrado" });
    }
    if (user.role !== "inversionista") {
      return res.json({ ok: false, message: "El usuario no es inversionista" });
    }

    if (amount <= 0) {
        return res.json({ ok: false, message: "El monto debe ser mayor a 0" });
    }

    if (campaign.activeOrInactive !== "activo") {
      return res.json({ok: false, message: "No se pueden hacer inversiones en campañas inactivas."});
    }

    const camp = await Campaign.findById(campaign);
    if (!camp) {
      return res.json({ ok: false, message: "Campaña no encontrada" });
    }
    
    const investorName = user.userName;
    const campaignName = camp.campaignName;
    
    const invest = await investmentSchema.create({
      campaign,
      investor,
      amount
    });

      campaignName
      campaignName
    return res.json({ ok: true, id: invest._id, investorName: investorName, campaignName: campaignName, invest: invest }); //muestra ok y id de registro en la BD
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones discriminada por campaña (para usuario administrador)
router.get("/all", async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el ID del administrador" });//Se valida que se haya ingresado el ID del administrador
    }
    const investments = await investmentSchema
      .find()
      .populate("campaign", "campaignName activeOrInactive owner")//Muestra el nombre de la campaña, estado y propietario de la campaña
      .populate("investor", "userName mail")//Muestra el userName y mail del inversionista
      .populate({
        path: "payments",//Información virtual del pago
        select: "provider amount status createdAt"
      })
      .lean({ virtuals: true });

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones realizadas por el usuario inversionista (se realiza búsqueda por su ID)
router.get("/investor/:investorId", async (req, res) => {
  try {
    const { investorId } = req.params;
    if (!investorId) {
      return res.json({ ok: false, message: "Falta el ID del inversionista" });//Se valida que se haya ingresado el ID del inversionista
    }
    const investments = await investmentSchema
      .find({ investor: investorId })
      .populate("campaign", "campaignName activeOrInactive owner")//Muestra el nombre de la campaña, estado y propietario de la campaña
      .populate({
        path: "payments",//Información virtual del pago
        select: "provider amount status createdAt"
      })
      .lean({ virtuals: true });

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones realizadas a la campaña (se realiza búsqueda por su ID)
router.get("/campaign/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    if (!campaignId) {
      return res.json({ ok: false, message: "Falta el campaignId" });//Se valida que se haya ingresado el ID de la campaña
    }
    const investments = await investmentSchema
      .find({ campaign: campaignId })
      .populate("investor", "userName mail")//Muestra el userName y mail del inversionista
      .populate({
        path: "payments",//Información virtual del pago
        select: "provider amount status createdAt"
      })
      .lean({ virtuals: true });

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Sólo los administradores pueden realizar actualizaciones en las inversiones
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el ID del administrador" });//Se valida que se haya ingresado el ID del admin
    }

    const user = await User.findById(adminId);
    if (!user) return res.json({ ok: false, message: "Usuario no encontrado" });//Se valida que el usuario esté en la BD
    if (user.role !== "administrador") {
      return res.json({ ok: false, message: "Solo los administradores pueden actualizar inversiones antiguas" });//Se valida que el ID sea de un administrador
    }

    const { amount, status } = req.body;//Sólo se puede actualizar el monto y el estado

    const validStatus = ["iniciado", "pagoPendiente", "confirmado", "fallido", "reembolsado"];
    if (status && !validStatus.includes(status)) {
      return res.json({ ok: false, message: `Estado inválido. Usa: ${validStatus.join(", ")}` });//Se valida que el estado a colocar esté en el listado
    }

    if (amount <= 0) {
        return res.json({ ok: false, message: "El monto debe ser mayor a 0" });
    }

    const updated = await investmentSchema.findByIdAndUpdate(//Se actualiza la información
      id,
      { $set: { amount, status } },
      { new: true }
    ).populate("campaign", "campaignName")//Muestra nomnbre de la campaña
    .populate("investor", "userName email");//Muestra el nombre del inversionista

    if (!updated) {
      return res.json({ ok: false, message: "Inversión no encontrada" });//Se valida que la inversión esté en la BD
    }

    return res.json({ ok: true, investment: updated });
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

router.delete("/deleteInvestments/:id", async (req, res) => {
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

    const { id } = req.params;
    const deleted = await investmentSchema.findByIdAndDelete(id);//Se elimina inversión
    if (!deleted) {
      return res.json({ ok: false, message: "Inversión no encontrada" });//Se valida que la inversión esté en la BD
    }

    return res.json({ ok: true, message: "Inversión eliminada exitosamente" });
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

module.exports = router;
