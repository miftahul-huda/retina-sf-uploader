//const LoggerModel  = require( './modules/models/loggermodel')

const { Sequelize, Model, DataTypes } = require('sequelize');
const process = require('process');
const ProcessStatusModel = require("./modules/models/processstatusmodel");
const StoreModel = require("./modules/models/storemodel");
const StoreUserModel = require("./modules/models/storeusermodel");
const StoreUserTempModel = require("./modules/models/storeusertempmodel");
const UploadHistoryModel = require("./modules/models/uploadhistorymodel");
const UserModel = require("./modules/models/usermodel");
const { logger } = require('sequelize/lib/utils/logger');


const sequelize = new Sequelize(process.env.TEMP_DBNAME, process.env.TEMP_DBUSER, process.env.TEMP_DBPASSWORD, {
    host: process.env.TEMP_DBHOST,
    dialect: process.env.TEMP_DBENGINE,
    logging: false
});

const sequelizeAuth = new Sequelize(process.env.AUTH_DBNAME, process.env.AUTH_DBUSER, process.env.AUTH_DBPASSWORD, {
    host: process.env.AUTH_DBHOST,
    dialect: process.env.AUTH_DBENGINE ,
    logging: false 
});


const sequelizeReal = new Sequelize(process.env.REAL_DBNAME, process.env.REAL_DBUSER, process.env.REAL_DBPASSWORD, {
    host: process.env.REAL_DBHOST,
    dialect: process.env.REAL_DBENGINE ,
    logging: false 
});



class Initialization {

    sequelize = null;
    sequelizeAuth = null;
    sequelizeReal = null;

    static async initializeDatabase(){

        let force = false;
        Initialization.sequelize = sequelize;
        Initialization.sequelizeAuth = sequelizeAuth;
        Initialization.sequelizeReal = sequelizeReal;
        
        ProcessStatusModel.initialize(sequelize, force);
        StoreModel.initialize(sequelizeReal, force);
        UploadHistoryModel.initialize(sequelize, force);
        StoreUserModel.initialize(sequelize, force);
        StoreUserTempModel.initialize(sequelize, force);

        UserModel.initialize(sequelizeAuth, force);


        await sequelize.sync();
        await sequelizeAuth.sync();
    }
}

module.exports = Initialization



