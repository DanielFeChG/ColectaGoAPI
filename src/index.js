const parser = require("body-parser");
const express = require('express');
const app = express();
const port = 3000;
const authRoutes = require("./routes/authentication.js");
const campaignRoutes = require("./routes/campaign.js");
const investmentRoutes = require("./routes/investment.js");
const userRoutes = require("./routes/user.js");
const paymentRoutes = require("./routes/payment.js");

const mongoose = require("mongoose");
require('dotenv').config();
app.use(parser.urlencoded({ extended: false })); //permite leer los datos que vienen en la petición
app.use(parser.json()); // transforma los datos a formato JSON

app.use(express.json());

//Gestión de las rutas usando el middleware
app.use("/api", authRoutes);
app.use("/api", campaignRoutes);
app.use("/api", investmentRoutes);
app.use("/api", userRoutes);
app.use("/api", paymentRoutes);

//Conexión a la base de datos
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexión exitosa"))
    .catch((error) => console.log(error));
//Conexión al puerto
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});