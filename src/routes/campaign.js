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
      //Primero se valida que el PDF quede obligatorio para subir
      if (!req.file)
        return res.json({
          message:
            "Se debe adjuntar el PDF del acta de constitución de la empresa.",
        });

      //Se solicitan los datos de texto
      const {
        owner,
        campaignName,
        crowdfunder,
        crowdfunderNIT,
        campaignObjectives,
        serviceOrProduct,
      } = req.body;

      //Después, se solicita el archivo PDF
      const pdf = req.file;
      const articlesOfIncorporation = {
        data: pdf.buffer,
        contentType: pdf.mimetype,
        filename: pdf.originalname,
        size: pdf.size,
        uploadedAt: new Date(), //Se asigna fecha actual
      };

      //Carga completa de información
      const campaign = await campaignSchema.create({
        owner,
        campaignName,
        crowdfunder,
        crowdfunderNIT,
        campaignObjectives,
        serviceOrProduct,
        articlesOfIncorporation,
      });
      return res.json({ ok: true, id: campaign._id }); //muestra ok y id de registro en la BD
    } catch (error) {
      res.json({ message: error }); //muestra mensaje de error
    }
  }
);

router.get("/seeCampaigns", async (req, res) => {
  try {
    const campaigns = await campaignSchema
    .find()
    .select(
      "-articlesOfIncorporation.data" //Se evidencia error en el anterior get ya que muestra todo el binario del PDF, por lo que se excluye para que la respuesta no sea desordenada
    )
    .populate("owner", "userName");
    res.json(campaigns);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/seePDFCampaign/:id/pdf", async (req, res) => {
  //Se busca el PDF por el ID de la campaña
  try {
    const { id } = req.params;
    const campaign = await campaignSchema.findById(id); //Se guarda la campaña en la constante

    if (!campaign || !campaign.articlesOfIncorporation) {
      return res.send("No se encontró el documento de constitución"); //Se verifica que el PDF exista
    }

    const pdf = campaign.articlesOfIncorporation; //Se obtiene solo el PDF de la campaña
    res.contentType(pdf.contentType || "application/pdf"); //Se devuelve un archivo PDF almacenado en la BD en application/pdf
    res.send(pdf.data); //Contenido binario
  } catch (e) {
    return res.json({ message: e.message });
  }
});

router.delete("/campaigns/:id", async (req, res) => {
  //Se elimina campaña de acuerdo a su ID
  try {
    const { id } = req.params;
    const campaigns = await campaignSchema.findById(id).select(
      //Se guarda la campaña a eliminar en la constante sin el binario del PDF
      "-articlesOfIncorporation.data"
    );
    campaignSchema
      .findByIdAndDelete(id) //Se elimina la campaña
      .then((data) => {
        res.json(campaigns); //Se muestra la campaña eliminada, pero sin el PDF para evitar desorden
      });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.put("/updateCampaign/:id", upload.single("articlesOfIncorporation"), async (req, res) => {
    try {
      const { id } = req.params;

      const body = req.body || {}; //Se guarda el body, inclusive si no está definido
      const fields = [
        "owner",
        "campaignName",
        "crowdfunder",
        "crowdfunderNIT",
        "campaignObjectives",
        "serviceOrProduct",
      ]; //Campos de texto del esquema
      const update = {}; //Array que guarda el campo a actualizar

      fields.forEach((field) => {
        //Se recorre el array para de acuerdo con cada campo
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          update[field] = body[field]; //El campo de la campaña debe ser el mismo que se quiera actualizar
        }
      });

      if (req.file) {
        const file = req.file; //Actualización de documento PDF
        update.articlesOfIncorporation = {
          data: file.buffer,
          contentType: file.mimetype,
          filename: file.originalname?.replace(/"/g, ""),
          size: file.size,
          uploadedAt: new Date(),
        };
      }

      const updated = await campaignSchema.findByIdAndUpdate(
        id,
        { $set: update }
      );

      //If para verificar si la campaña se encuentra o no
      if (!updated) return res.json({ message: "Campaña no encontrada" });

      res.json({ ok: true, id: updated._id, updated: Object.keys(update) });
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

module.exports = router;
