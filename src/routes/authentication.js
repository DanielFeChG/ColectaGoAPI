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
    user.clave = await user.encryptClave(user.clave);
    await user.save(); //save es un método de mongoose para guardar datos en MongoDB 
    //res.json(user);
    res.json({ message: "Usuario guardado." });
});
module.exports = router;

//inicio de sesión
router.post("/login", async (req, res) => {
    // validaciones
    const { error } = userSchema.validate(req.body.correo, req.body.clave);
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