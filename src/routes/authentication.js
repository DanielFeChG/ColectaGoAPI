const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const userSchema = require("../models/userModel");
const Crowdfounder = require("../models/crowdfounderModel");
const Investor = require("../models/investorModel");
const jwt = require('jsonwebtoken');

const Administrator = require("../models/adminModel");

//------------------------------ REGISTRO DE USUARIO --------------------------------------
router.post('/signup', async (req, res) => {
    try {
        const { userName, mail, password, country, phone, role, bio, organization, website, verified, rating, followers, campaigns, balance, investedAmount, investmentCount, inversiones, permissions } = req.body;

        // Crear usuario según el rol
        if (role === "crowdfounder") {
            newUser = new Crowdfounder({
                userName,
                mail,
                password,
                country,
                phone,
                role,
                bio,
                organization,
                website,
                verified,
                rating,
                followers,
                campaigns
            });
        } else if (role === "inversionista") {
            newUser = new Investor({
                userName,
                mail,
                password,
                country,
                phone,
                role,
                balance,
                investedAmount,
                investmentCount,
                inversiones,
                rating
            });
        } else if (role === "administrador") {
            newUser = new Administrator({
                userName,
                mail,
                password,
                country,
                phone,
                role,
                permissions
            });
        } else {
            return res.status(400).json({ error: "Rol no válido" });
        }

        //Encriptar la contraseña
        newUser.password = await newUser.encryptClave(newUser.password);

        //Guarda la data
        await newUser.save();
        res.json({ message: "Usuario registrado." });
    } catch (error) {
        console.error("Error en /signup:", error);
        res.status(500).json({ error: "Error al registrar el usuario." });
    }
});

//---------------------------- INICIO DE SESION ----------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { mail, password } = req.body;

    // 1. Buscar usuario por mail
    const user = await userSchema.findOne({ mail });
    if (!user) {
      return res.json({ ok: false, message: 'Usuario no encontrado' });
    }

    // 2. Comparar contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ ok: false, message: 'Contraseña incorrecta' });
    }

    // 3. Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Devolver token + usuario
    res.json({
      ok: true,
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        mail: user.mail,
        country: user.country,
        phone: user.phone,
        role: user.role,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error en el servidor' });
  }
});


// Ruta para obtener todos los usuarios (TEMPORAL)
router.get("/users", async (req, res) => {
    try {
        // Obtener todos los usuarios
        const users = await userSchema.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No se encontraron usuarios" });
        }
        // Enviar la lista de usuarios
        res.json({ users });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Hubo un problema al obtener los usuarios" });
    }
});

// Ruta para eliminar todos los usuarios (TEMPORAL)
router.delete("/users", async (req, res) => {
    try {
        // Eliminar todos los usuarios de la base de datos
        const result = await userSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No se encontraron usuarios para eliminar" });
        }

        // Responder con un mensaje de éxito
        res.json({ message: "Todos los usuarios han sido eliminados." });
    } catch (error) {
        console.error("Error al eliminar los usuarios:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar los usuarios" });
    }
});


module.exports = router;