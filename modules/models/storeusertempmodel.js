const { Model, DataTypes } = require('sequelize');

class StoreUserTempModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            sfcode: DataTypes.STRING,
            username: DataTypes.STRING,
            name: DataTypes.STRING,
            storeid: DataTypes.STRING,
            store_name: DataTypes.STRING,
            store_cluster: DataTypes.STRING, 
            store_area: DataTypes.STRING, 
            store_region: DataTypes.STRING,
            store_branch: DataTypes.STRING,
            store_city: DataTypes.STRING,
            store_kecamatan: DataTypes.STRING,
            archetype: DataTypes.STRING,
            tag: DataTypes.STRING
        }, 
        { sequelize, modelName: 'store_user_temporary', tableName: 'store_user_temporary', force: force });
    }
}

module.exports = StoreUserTempModel;