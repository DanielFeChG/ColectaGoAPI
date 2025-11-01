const express = require("express");
const router = express.Router(); //manejador de rutas de express para manejarlas
const userSchema = require("../models/userModel"); //Ruta del modelo de usuario



//Consultar usuario por userName
router.get("/users/:userName", (req, res) => {
    const { userName } = req.params;
    userSchema
        .find({userName:{$eq:userName}})
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

//Consultar usuario por su id
router.get("/users/id/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});


// Actualizar usuario
router.put("/users/update/:id", (req, res) => {
    const { id } = req.params;
    const { userName, mail, password, country, phone, bio, organization, website} = req.body;
    userSchema
        .updateOne({ _id: id }, {
            $set: { userName, mail, password, country, phone, bio, organization, website }
        })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

//Eliminar un usuario por su id
router.delete("/users/delete/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findByIdAndDelete(id)
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.json({ message: error });
        });
});

module.exports = router;