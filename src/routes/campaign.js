const express = require("express");
const router = express.Router(); //manejador de rutas de express para manejarlas
const animalSchema = require("../models/campaignModel"); //Ruta del modelo de campaña

router.post("/newCampaign", (req, res) => {
  const campaign = campaignSchema(req.body); //body de la peticion (headers y body) BD
  campaign
    .save() //guardar en la BD
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error })); //muestra mensaje de error
});

router.get("/seeCampaigns", (req, res) => {
  animalSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});
