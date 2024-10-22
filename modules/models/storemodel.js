const { Model, DataTypes } = require('sequelize');

class StoreModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            storeid: DataTypes.STRING,
            store_name: DataTypes.STRING,
            store_cluster: DataTypes.STRING, 
            store_area: DataTypes.STRING, 
            store_region: DataTypes.STRING,
            store_branch: DataTypes.STRING,
            store_city: DataTypes.STRING,
            tag: DataTypes.STRING,
            archetype: DataTypes.STRING
        }, 
        { sequelize, modelName: 'store', tableName: 'store', force: force });
    }
}

module.exports = StoreModel;