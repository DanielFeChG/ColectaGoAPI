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
    if (user.rol !== "inversionista") {
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

router.get("/investments/allInvestments", async (req, res) => {
  try {
    const investments = await investmentSchema
      .find()
      .populate("campaign", "title status owner")
      .populate("investor", "userName mail")
      .lean();

    investments.forEach((i) => {
      if (i.amount?.toString) i.amount = i.amount.toString();
    });

    res.json({ ok: true, total: investments.length, investments });
  } catch (error) {
    res.json({ ok: false, message: error.message });
  }
});

module.exports = router;
