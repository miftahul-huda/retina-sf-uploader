const { Model, DataTypes } = require('sequelize');

class StoreUserModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            sfcode: DataTypes.STRING,
            username: DataTypes.STRING,
            storeid: DataTypes.STRING, 
            store_name: DataTypes.STRING,
            tag: DataTypes.STRING
        }, 
        { sequelize, modelName: 'store_user', tableName: 'store_user', force: force });
    }
}

module.exports = StoreUserModel;