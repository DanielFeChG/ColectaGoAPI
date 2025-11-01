const express = require("express");
const router = express.Router(); //manejador de rutas de express para manejarlas
const User = require("../models/userModel");
const investmentSchema = require("../models/investmentModel"); //Ruta del modelo de inversión

router.post("/invest", async (req, res) => {
  try {
    const { campaign, investor, amount } = req.body;

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
    
    const invest = await investmentSchema.create({
      campaign,
      investor,
      amount,
      //payment,
    });

    return res.json({ ok: true, id: invest._id }); //muestra ok y id de registro en la BD
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones discriminada por campaña (para usuario administrador)
router.get("/investments/all", async (req, res) => {
  try {
    const investments = await investmentSchema
      .find()
      .populate("campaign", "campaignName activeOrInactive owner")//Muestra el nombre de la campaña, estado y propietario de la campaña
      .populate("investor", "userName mail")//Muestra el userName y mail del inversionista
      .lean();

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones realizadas por el usuario inversionista (se realiza búsqueda por su ID)
router.get("/investments/investor/:investorId", async (req, res) => {
  try {
    const { investorId } = req.params;
    if (!investorId) {
      return res.json({ ok: false, message: "Falta el investorId" });//Se valida que se haya ingresado el ID del inversionista
    }
    const investments = await investmentSchema
      .find({ investor: investorId })
      .populate("campaign", "campaignName activeOrInactive owner")//Muestra el nombre de la campaña, estado y propietario de la campaña
      .lean();

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

//Visualización de todas las inversiones realizadas a la campaña (se realiza búsqueda por su ID)
router.get("/investments/campaign/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    if (!campaignId) {
      return res.json({ ok: false, message: "Falta el campaignId" });//Se valida que se haya ingresado el ID de la campaña
    }
    const investments = await investmentSchema
      .find({ campaign: campaignId })
      .populate("investor", "userName mail")//Muestra el userName y mail del inversionista
      .lean();

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

//Sólo los administradores pueden realizar actualizaciones en las inversiones
router.put("/investments/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el adminId" });//Se valida que se haya ingresado el ID del usuario
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

    const updated = await investmentSchema.findByIdAndUpdate(//Se actualiza la información
      id,
      { $set: { amount, status } },
      { new: true }
    )
      .populate("campaign", "campaignName")//Muestra nomnbre de la campaña
      .populate("investor", "userName email");//Muestra el nombre del inversionista

    if (!updated) {
      return res.json({ ok: false, message: "Inversión no encontrada" });//Se valida que la inversión esté en la BD
    }

    return res.json({ ok: true, investment: updated });
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

router.delete("/investments/:id", async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el adminId" });//Se valida que se haya ingresado el ID del usuario
    }

    const user = await User.findById(adminId);
    if (!user) return res.json({ ok: false, message: "Usuario no encontrado" });//Se valida que el usuario esté en la BD
    if (user.role !== "administrador") {
      return res.json({ ok: false, message: "Solo los administradores pueden eliminar inversiones" });//Se valida que el ID sea de un administrador
    }

    const { id } = req.params;
    const deleted = await Investment.findByIdAndDelete(id);//Se elimina inversión
    if (!deleted) {
      return res.json({ ok: false, message: "Inversión no encontrada" });//Se valida que la inversión esté en la BD
    }

    return res.json({ ok: true, message: "Inversión eliminada exitosamente" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
