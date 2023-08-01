const { json } = require('express');
const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLNonNull, GraphQLList, GraphQLError, GraphQLEnumType} = require('graphql')
const Clients = require('../models/Clients.js');
const Projects = require('../models/Projects.js');
const { default: mongoose } = require('mongoose');

//!CLIENT TYPE OR OBJECT (Bisa dibilang MODEL)
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: ()=>({
        id: {type: GraphQLID},
        name:{type: GraphQLString},
        email:{type: GraphQLString},
        phone:{type: GraphQLString}
    })
})

//!PROJECT TYPER OR OBJECT
const ProjectType = new GraphQLObjectType({
    name:'Project',
    fields: ()=>({
        id: {type: GraphQLID},
        //!CLIENT TYPE ADALAH CHILD DARI PROJECT TYPE JIKA BERADA DISINI
        clientId: {
            type: ClientType,
            resolve(parent,args){
                //!KARENA CHILD MAKA PARENT DARI CLIENT TYPE ADALAH PROJECT TYPE
                //!----------------------------------------------↓----------
                return Clients.findById(parent.clientId) //!MENYAMAKAN ID DARI client type DENGAN clientId DARI PROJECT TYPE
                //!HAL INI DIGUNAKAN SEBAGAI PATOKAN ATAU FOREGN KEY (KUNCI TAMU)
            }
        },
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString}
    })
})

//! ↓ ROOT QUERY
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    //! ↓ MASUKKAN QUERY KE FIELD UNTUK QUERY
    fields:{

        //! ↓ GET ALL CLIENT
        getAllClients:{
            //! ↓ NGAMBIL DARI MODEL ATAU OBJECT TYPE CLIENT
            type: new GraphQLList(ClientType),
            resolve(parent,args){
                return Clients.find();
            }
        },

        //! ↓ GET CLIENT BY ID
        clientbyId:{
            //! ↓ NGAMBIL DARI MODEL ATAU OBJECT TYPE CLIENT
            type: ClientType,
            //! ↓ ARGUMEN ATAU PARAMETER 
            args : {clientId: {type: new GraphQLNonNull(GraphQLID)}}, //! clientId DISNI MENYAMBUNG KE ARGUMEN DI RESOLVE
            //! ↓ RESPONE FROM THIS QUERY
            resolve(parent, args){
                                //!MEMANGGIL OBJECT TYPE clients LALU HANYA MENGAMBIL BAGIAN ID
                                //!---↓-----------↓-----
                return Clients.findById(args.clientId) //!clientId DIGUNAKAN DISINI
            }
        },

        //! ↓ GET ALL PROJECT
        getAllProjects:{
            type: new GraphQLList(ProjectType),
            resolve(parent,args){
                return Projects.find();
            }
        },

        //! ↓ GET ALL PROJECT
        getProjectById:{
            type: ProjectType,
            args: {projectId: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parent,args){
                return Projects.findById(args.projectId)
            }
        }       
    }
});

const doMutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{

        //? CLIENT
        //TODO CREATE CLIENT
        createClient:{
            type: ClientType,
            //! TO SETTLE HOW YOU SHOULD INSERT DATA (IS IT NULL, OR NOT NULL, TYPE DATA)
            //! IT IS INPUT
            args:{
                name:{type: new GraphQLNonNull(GraphQLString)},
                email:{type: new GraphQLNonNull(GraphQLString)},
                phone:{type: new GraphQLNonNull(GraphQLString)},
            }, 
            resolve(parent, args){
                //! INSERT DATA FROM INPUT TO MODEL SO IT CAN MATCH WITH DATABASE
                const clientInputData = new Clients({
                    //! GET DATA FROM INPUT DATA AND MATCH WITH MODELS
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })
                //! ADD TO DATABASE
                return clientInputData.save();
            }
        },

        //TODO UPDATE CLIENT
        updateClient:{
            type:ClientType,
            args:{
                id:{type: new GraphQLNonNull(GraphQLID)},
                name:{type: GraphQLString},
                email:{type: GraphQLString},
                phone:{type: GraphQLString}
            },resolve(parent, args){
                const updateFields = {}
                //! UNTUK MENCEK APAKAH FIELD YANG DIISI PADA ARGUMEN MEMILIKI VALUE
                //! JIKA TIDAK MEMILIKI VALUE MAKA ARGUMEN DINYATAKAN KOSONG
                //! JIKA MEMILIKI VALUE MAKA VALUE TERSEBUT AKAN DIINPUT KE UPDATEFIELDS
                if(args.name)updateFields.name = args.name
                if(args.email)updateFields.email = args.email
                if(args.phone)updateFields.phone = args.phone
                                            //! findById-{{Operator}}-Field-----MENAMPILKAN DOKUMEN YANG TELAH DI UPDATE BUKAN YANG BELUM
                                            //! ---↓--------↓↓--------↓↓↓----------↓
                return Clients.findByIdAndUpdate(args.id, {$set: updateFields}, new true)
            }
        },

        //TODO DELETE CLIENT
        deleteClient:{
            type:ClientType,
            args:{
                clientId:{type: new GraphQLNonNull(GraphQLID)}
            },resolve(parent, args){
                return Clients.findByIdAndRemove(args.clientId)
            }
        },

        //? PROJECT
        //TODO CREATE PROJECT DATA
        createProject:{
            type:ProjectType,
            args:{
                clientId:{type: new GraphQLNonNull(GraphQLID)},
                name:{type: new GraphQLNonNull(GraphQLString)},
                description:{type: new GraphQLNonNull(GraphQLString)},
                status:{type: new GraphQLEnumType({
                    name:'ProjectStatus',
                    values:{
                        'New': {value: 'Not Started'},
                        'Progress': {value: 'In Progress'},
                        'Completed': {value: 'Completed'}
                    }
                }),
                defaultValue: 'No Status',
            }},
            resolve(parent, args){
                const projectInputData = new Projects({
                    clientId: args.clientId,
                    name: args.name,
                    description: args.description,
                    status: args.status
                })
                return projectInputData.save();
            }
        },

        //TODO UPDATE PROJECT DATA
        updateProject:{
            type: ProjectType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                clientId: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                description: {type: new GraphQLNonNull(GraphQLString)},
                status:{type: new GraphQLEnumType({
                    name:'ProjectStatusUpdate',
                    values:{
                        'New': {value: 'Not Started'},
                        'Progress': {value: 'In Progress'},
                        'Completed': {value: 'Completed'}
                    }
                }), defaultValue: 'Not Started'}
            },resolve(parent, args){
                const updateFields = {}
                if(args.clientId)updateFields.clientId = args.clientId
                if(args.name)updateFields.name = args.name
                if(args.description)updateFields.description = args.description
                if(args.status)updateFields.status = args.status

                return findByIdAndUpdate(args.id, {$set: updateFields}, new true)
            }
        },

        //TODO DELETE PROJECT DATA
        deleteProject:{
            type: ProjectType,
            args:{
                projectId:{type: new GraphQLNonNull(GraphQLID)}
            },resolve(parent, args){
                return findByIdAndRemove(args.projectId)
            }
        }
    }
})

module.exports =  new GraphQLSchema({
    query:  RootQuery,
    mutation: doMutation
})