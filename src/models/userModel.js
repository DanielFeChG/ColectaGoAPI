const mongoose = require("mongoose"); // importando el componente mongoose
const bcrypt = require("bcrypt"); // importando el componente bcrypt
const options = { discriminatorKey: "role", collection: "users" };

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique:true
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
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
}, options);

    
userSchema.methods.encryptClave = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
module.exports = mongoose.model('User', userSchema);