const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const userSchema = require("../models/userModel");
const Crowdfounder = require("../models/crowdfounderModel");
//const Investor = require("../models/investorModel");
//const Administrator = require("../models/adminModel");

//registrar usuario
router.post('/signup', async (req, res) => {
    try{
    const { userName, mail, password, country, phone, role, bio, organization, website, verified, rating, followers, campaigns} = req.body;

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
    } //else if (role === "inversionista") {
        //newUser = new Investor({
            //userName,
            //mail,
            //password: hashedPassword,
            //country,
            //phone,
            //role,
            //balance,
            //inversiones
        //});
    // } else if (role === "administrador") {
    //     newUser = new Administrator({
    //         userName,
    //         mail,
    //         password: hashedPassword,
    //         country,
    //         phone,
    //         role
    //     });
    //} 
    else {
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
module.exports = router;

//-----------------------------------------------------------------

//inicio de sesión
router.post("/login", async (req, res) => {
    const { error } = userSchema.validate(req.body.mail, req.body.password);
    if (error) return res.status(400).json({ error: error.details[0].message });
    //Busca el usuario por su dirección de correo
    const user = await userSchema.findOne({ mail: req.body.mail });
    //valida si no se encuentra
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    //Transformando la contraseña a su valor original para 
    //compararla con la clave que se ingresa en el inicio de sesión
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
        return res.status(400).json({ error: "Clave no válida" });
    res.json({
        error: null,
        data: "Bienvenido(a)",
    });
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
