const { response } = require("express")
const mongoose = require("mongoose")

async function connectDB(){
    try {
        const connectdb = await mongoose.connect(process.env.DATABASE_URI)
        console.log("Connect to Database with", connectdb.connection.host)
    } catch (error) {
        console.log(error)
        response.status(500)
    }
}

module.exports = {connectDB}