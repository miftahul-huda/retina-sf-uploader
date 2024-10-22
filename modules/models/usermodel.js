const { Model, DataTypes } = require('sequelize');

class UserModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            sfcode: DataTypes.STRING,
            email: DataTypes.STRING,
            fullname: DataTypes.STRING, 
            lastLogin: DataTypes.DATE,
            tag: DataTypes.STRING
        }, 
        { sequelize, modelName: 'user', tableName: 'user', force: force });
    }
}

module.exports = UserModel;