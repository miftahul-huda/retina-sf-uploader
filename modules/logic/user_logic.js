const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");

class UserLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/usermodel");
        return model;
    }

    static getPk(){
        return "id";
    }

    static getWhere(search)
    {
        let where = {
            [Op.or]:[
                {
                    sfcode : {
                        [Op.like] : "%" + search + "%"
                    } 
                }
                ,
                {
                    email : {
                        [Op.like] : "%" + search + "%"
                    } 
                }
            ]
            
        }
        return where;
    }

    static getOrder()
    {
        let order = [['sfcode', 'ASC']];
        return order;
    }
}

module.exports = UserLogic;