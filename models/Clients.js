const { Mongoose, Schema, default: mongoose } = require("mongoose");

const clientSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Need Client Name"]
    },
    email:{
        type: String,
        required: [true, "Need Client Email"]
    },
    phone:{
        type: String,
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Clients', clientSchema)