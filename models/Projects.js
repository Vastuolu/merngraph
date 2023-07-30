const { default: mongoose } = require("mongoose");

const projectsSchema = mongoose.Schema({
    //* TO GET CLIENT ID
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        //! THIS IS THE REFERENCE OR RELATION FROM MONGODB
        ref: 'Clients'
    },
    name:{
        type: String,
        required: [true, "Project need a name"]
    },
    description:{
        type: String,
        default: "project"
    },
    status:{
        type: String,
        enum:["Not Started", "In Progress", "Completed"]
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Projects', projectsSchema)
