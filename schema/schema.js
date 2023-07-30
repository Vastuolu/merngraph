const { json } = require('express');
const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLNonNull, GraphQLList, GraphQLError} = require('graphql')
const Clients = require('../models/Clients.js');
const Projects = require('../models/Projects.js');
const { default: mongoose } = require('mongoose');

//CLIENT TYPE OR OBJECT (Bisa dibilang MODEL)
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: ()=>({
        id: {type: GraphQLID},
        name:{type: GraphQLString},
        email:{type: GraphQLString},
        phone:{type: GraphQLString}
    })
})

//PROJECT TYPER OR OBJECT
const ProjectType = new GraphQLObjectType({
    name:'Project',
    fields: ()=>({
        id: {type: GraphQLID},
        //CLIENT TYPE ADALAH CHILD DARI PROJECT TYPE JIKA BERADA DISINI
        clientId: {
            type: ClientType,
            resolve(parent,args){
                //KARENA CHILD MAKA PARENT DARI CLIENT TYPE ADALAH PROJECT TYPE
                //----------------------------------------------↓----------
                return Clients.findById(parent.clientId) //MENYAMAKAN ID DARI client type DENGAN clientId DARI PROJECT TYPE
                //HAL INI DIGUNAKAN SEBAGAI PATOKAN ATAU FOREGN KEY (KUNCI TAMU)
            }
        },
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString}
    })
})

// ↓ ROOT QUERY
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    // ↓ MASUKKAN QUERY KE FIELD UNTUK QUERY
    fields:{

        // ↓ GET ALL CLIENT
        getAllClients:{
            // ↓ NGAMBIL DARI MODEL ATAU OBJECT TYPE CLIENT
            type: new GraphQLList(ClientType),
            resolve(parent,args){
                return Clients.find();
            }
        },

        // ↓ GET CLIENT BY ID
        clientbyId:{
            // ↓ NGAMBIL DARI MODEL ATAU OBJECT TYPE CLIENT
            type: ClientType,
            // ↓ ARGUMEN ATAU PARAMETER 
            args : {clientId: {type: new GraphQLNonNull(GraphQLID)}}, //clientId DISNI MENYAMBUNG KE ARGUMEN DI RESOLVE
            // ↓ RESPONE FROM THIS QUERY
            resolve(parent, args){
                                //MEMANGGIL OBJECT TYPE clients LALU HANYA MENGAMBIL BAGIAN ID
                                //----↓-----------↓-----
                return Clients.findById(args.clientId) //clientId DIGUNAKAN DISINI
            }
        },

        // ↓ GET ALL PROJECT
        getAllProjects:{
            type: new GraphQLList(ProjectType),
            resolve(parent,args){
                return Projects.find();
            }
        },

        // ↓ GET ALL PROJECT
        getProjectById:{
            type: ProjectType,
            args: {projectId: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parent,args){
                return Projects.findById(args.projectId)
            }
        }       
    }
});

module.exports =  new GraphQLSchema({
    query:  RootQuery
})