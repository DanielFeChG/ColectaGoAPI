const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router(); //manejador de rutas de express
const userSchema = require("../models/userModel");
router.post('/signup', async (req, res) => {
    const { userName, mail, password, country, phone, role} = req.body;
    const user = new userSchema({
        userName: userName,
        mail: mail,
        password: password,
        country: country,
        phone: phone,
        role, role
    });
    user.password = await user.encryptClave(user.password);
    await user.save(); //save es un método de mongoose para guardar datos en MongoDB 
    //res.json(user);
    res.json({ message: "Usuario guardado." });
});
module.exports = router;

//inicio de sesión
router.post("/login", async (req, res) => {
    // validaciones
    const { error } = userSchema.validate(req.body.mail, req.body.password);
    if (error) return res.status(400).json({ error: error.details[0].message });
    //Buscando el usuario por su dirección de correo
    const user = await userSchema.findOne({ mail: req.body.mail });
    //validando si no se encuentra
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


// Ruta para obtener todos los usuarios
router.get("/users", async (req, res) => {
    try {
        // Obtener todos los usuarios, pero excluyendo el campo "password"
        const users = await userSchema.find({}, { password: 0 }); // El campo "password" no será devuelto

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


// Ruta para eliminar todos los usuarios
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
