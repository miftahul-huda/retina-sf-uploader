const { Model, DataTypes } = require('sequelize');

class UploadHistoryModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            uploaded_by: DataTypes.STRING,
            uploded_file: DataTypes.STRING,
            tag: DataTypes.STRING
        }, 
        { sequelize, modelName: 'uploadhistory', tableName: 'uploadhistory', force: force });
    }
}

module.exports = UploadHistoryModel;