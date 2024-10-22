const { Model, DataTypes } = require('sequelize');

class ProcessStatusModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            status: DataTypes.STRING,
            message: DataTypes.STRING,
            session: DataTypes.STRING, 
            data: DataTypes.TEXT
        }, 
        { sequelize, modelName: 'process_status', tableName: 'process_status', force: force });
    }
}

module.exports = ProcessStatusModel;