const express = require("express");
const multer = require("multer");
const router = express.Router(); //manejador de rutas de express para manejarlas
const campaignSchema = require("../models/campaignModel"); //Ruta del modelo de campaña

const upload = multer({
  storage: multer.memoryStorage(), //configuración de multer para subir archivos pdf
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB como límite de subida de archivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Solo PDF")); //sólo se debe subir archivos PDF
    cb(null, true);
  },
});

router.post("/newCampaign", upload.single("articlesOfIncorporation"), async (req, res) => {
    try {
        const {
            campaignName,
            crowdfounder,
            crowdfounderNIT,
            campaignObjectives,
            serviceOrProduct
        } = req.body;

        const pdf = req.file;
        const articlesOfIncorporation = {
            data: pdf.buffer,
            contentType: pdf.mimetype,
            filename: pdf.originalname,
            size: pdf.size,
            uploadedAt: new Date() //Fecha actual
        };

        const campaign = await campaignSchema.create({
            campaignName,
            crowdfounder,
            crowdfounderNIT,
            campaignObjectives,
            serviceOrProduct,
            articlesOfIncorporation
        });
        return res.json(data);
    } catch(error) {
        res.json({ message: error });//muestra mensaje de error
    }
});

router.get("/seeCampaigns", (req, res) => {
   animalSchema
     .find()
     .then((data) => res.json(data))
     .catch((error) => res.json({ message: error }));
});

module.exports = router;