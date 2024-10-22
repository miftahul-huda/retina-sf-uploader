const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");

class OutletLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/storemodel");
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
                    store_name : {
                        [Op.like] : "%" + search + "%"
                    } 
                }
                ,
                {
                    storeid : {
                        [Op.like] : "%" + search + "%"
                    } 
                }
            ]
            
        }
        return where;
    }

    static getOrder()
    {
        let order = [['storeid', 'ASC']];
        return order;
    }
}

module.exports = OutletLogic;