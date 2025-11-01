const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const User = require("./userModel");


const adminSchema = new mongoose.Schema({
     permissions: [
    {
      type: String,
      enum: [
        "manage_users",
        "manage_campaigns",
        "manage_investments",
        "view_reports",
        "manage_roles",
        "system_settings"
      ],
    },
  ],
});

const Administrator = User.discriminator("administrador", adminSchema);
module.exports = Administrator;
