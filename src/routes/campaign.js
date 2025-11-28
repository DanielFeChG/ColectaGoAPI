const express = require("express");
const multer = require("multer");
const router = express.Router(); //manejador de rutas de express para manejarlas
const campaignSchema = require("../models/campaignModel"); //Ruta del modelo de campaña
const User = require("../models/userModel");

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
    if (!req.file) {
      return res.json({message: "Se debe adjuntar el PDF del acta de constitución de la empresa."});
    }

    //Se solicitan los datos de texto
    const {
      owner,
      campaignName,
      NIT,
      campaignObjectives,
      serviceOrProduct,
    } = req.body;

    //Validaciones que indican si todos los campos fueron diligenciados
    if (!owner) {
      return res.json({ ok: false, message: "Falta el ID del crowdfunder" });
    } else if (!campaignName) {
      return res.json({ ok: false, message: "Falta el nombre de la campaña"});
    } else if (!NIT) {
      return res.json({ ok: false, message: "Falta el NIT de la empresa" });
    } else if (!campaignObjectives) {
      return res.json({ ok: false, message: "Faltan los objetivos de la campaña" });
    } else if (!serviceOrProduct) {
      return res.json({ ok: false, message: "Falta el desglose de producto o servicio" });
    } 
    //Validación de que el usuario que crea la campaña sea crowdfunder
    const user = await User.findById(owner);
    if (!user) {
      return res.json({ ok: false, message: "Usuario no encontrado" });
    }
    if (user.role !== "crowdfounder") {
      return res.json({ ok: false, message: "El usuario no es crowdfunder" });
    }

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
      NIT,
      campaignObjectives,
      serviceOrProduct,
      articlesOfIncorporation,
    });
    return res.json({ ok: true, id: campaign._id }); //muestra ok y id de registro en la BD
  } catch (error) {
    res.json({ message: 'No fue posible crear la campaña' }); //muestra mensaje de error
  }
});

router.get("/seeCampaigns", async (req, res) => {
  try {
    const campaigns = await campaignSchema
      .find()
      .select(
        "-articlesOfIncorporation.data" //Se evidencia error en el anterior get ya que muestra todo el binario del PDF, por lo que se excluye para que la respuesta no sea desordenada
      )
      .populate("owner", "userName");
    res.json({ ok: true, total: campaigns.length, campaigns });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/seeCampaignsByOwner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    // Buscar campañas del usuario
    const campaigns = await campaignSchema
      .find({ owner: ownerId })
      .select("-articlesOfIncorporation.data")
      .populate("owner", "userName role")
      .sort({ createdAt: -1 });

    return res.json({
      ok: true,
      total: campaigns.length,
      campaigns,
    });
  } catch (error) {
    return res.json({ ok: false, message: error.message });
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

//Se elimina campaña de acuerdo a su ID
router.delete("/deleteCampaign/:id", async (req, res) => {
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

    const campaign = await campaignSchema.findById(id).select("-articlesOfIncorporation.data");//Se guarda la campaña a eliminar en la constante sin el binario del PDF
    
    if (!campaign) {
      return res.json({ ok: false, message: "Campaña no encontrada" });//Se valida que la inversión esté en la BD
    } 

    const deleted = await campaignSchema.findByIdAndDelete(id) //Se elimina la campaña
    
    if (!deleted) {
      return res.json({ ok: false, message: "La campaña no fue eliminada" });
    } else {
      return res.json({ ok: true, message: "Campaña eliminada exitosamente" });
    }
    
  } catch (error) {
    res.json({ message: error.message });
  }
});

//Se actualiza campaña de acuerdo con su ID. Solo el admin puede cambiar la informacion
router.put("/updateCampaign/:id", upload.single("articlesOfIncorporation"),async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    if (!adminId) {
      return res.json({ ok: false, message: "Falta el ID del administrador" });//Se valida que se haya ingresado el ID del admin
    }

    const user = await User.findById(adminId);
    if (!user) return res.json({ ok: false, message: "Usuario no encontrado" });//Se valida que el usuario esté en la BD
    if (user.role !== "administrador") {
      return res.json({ ok: false, message: "Solo los administradores pueden actualizar campañas" });//Se valida que el ID sea de un administrador
    }

    const body = req.body || {}; //Se guarda el body, inclusive si no está definido
    const fields = [
      "campaignName",
      "NIT",
      "campaignObjectives",
      "serviceOrProduct",
      "activeOrInactive"
    ]; //Campos de texto del esquema que se pueden actualizar
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

    const updated = await campaignSchema.findByIdAndUpdate(id, {
      $set: update,
    });

    //If para verificar si la campaña se encuentra o no
    if (!updated) return res.json({ message: "Campaña no encontrada" });

    res.json({ ok: true, id: updated._id, updated: Object.keys(update) });
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
