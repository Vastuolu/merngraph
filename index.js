const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema.js')
const mongoose = require('mongoose')
require('dotenv').config()
const port = process.env.PORT || 5000;
const dbconfig = require('./database/dbconfig.js')
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}))

//CONNECT DATABASE
dbconfig.connectDB()

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql : process.env.NODE_ENV ==='development'
}))

app.listen(port, (req,res)=>{
    try {
        console.log(`Berhasil tersambung ke http://127.0.0.1:${port}`)
    } catch (error) {
        console.log(error)
    }
});

