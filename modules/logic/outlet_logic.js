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
                        [Op.iLike] : "%" + search + "%"
                    } 
                }
                ,
                {
                    storeid : {
                        [Op.iLike] : "%" + search + "%"
                    } 
                }
            ]
            
        }
        return where;
    }

    static getDefaultWhere()
    {
        let where = {
            [Op.and]: [
                { isActive : 1},
                { tag: { [Op.not] : null } }
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