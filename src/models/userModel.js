const mongoose = require("mongoose"); // importando el componente mongoose
const bcrypt = require("bcrypt"); // importando el componente bcrypt
const userSchema = mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    clave: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: false
    },
    role: {
        type: String,
        enum: ['crowdfounder', 'inversionista', 'administrador'],
        required: true,
  },
});
userSchema.methods.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}
module.exports = mongoose.model('User', userSchema);