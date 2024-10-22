//const LoggerModel  = require( './modules/models/loggermodel')

const { Sequelize, Model, DataTypes } = require('sequelize');
const process = require('process');
const ProcessStatusModel = require("./modules/models/processstatusmodel");
const StoreModel = require("./modules/models/storemodel");
const StoreUserModel = require("./modules/models/storeusermodel");
const StoreUserTempModel = require("./modules/models/storeusertempmodel");
const UploadHistoryModel = require("./modules/models/uploadhistorymodel");
const UserModel = require("./modules/models/usermodel");


const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: process.env.DBENGINE  
});

const sequelizeAuth = new Sequelize(process.env.AUTH_DBNAME, process.env.AUTH_DBUSER, process.env.AUTH_DBPASSWORD, {
    host: process.env.AUTH_DBHOST,
    dialect: process.env.AUTH_DBENGINE  
});


class Initialization {

    sequelize = null;
    sequelizeAuth = null;

    static async initializeDatabase(){

        let force = false;
        Initialization.sequelize = sequelize;
        Initialization.sequelizeAuth = sequelizeAuth;
        
        ProcessStatusModel.initialize(sequelize, force);
        StoreModel.initialize(sequelize, force);
        UploadHistoryModel.initialize(sequelize, force);
        StoreUserModel.initialize(sequelize, force);
        StoreUserTempModel.initialize(sequelize, force);

        UserModel.initialize(sequelizeAuth, force);


        await sequelize.sync();
        await sequelizeAuth.sync();
    }
}

module.exports = Initialization



