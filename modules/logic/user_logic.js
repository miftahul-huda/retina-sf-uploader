const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");
const StoreUserModel = require("../models/storeusermodel");
const StoreModel = require("../models/storemodel")

class UserLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/usermodel");
        return model;
    }

    static getPk(){
        return "id";
    }

    static findUserStores(user, offset, limit, orderArr )
    {
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 
                let where = {
                    [Op.and] : [
                        { isActive: 1 },
                        {  username: {
                            [Op.iLike] : user
                        }}
                    ]

                }
                let storeUsers = await StoreUserModel.findAll({ where: where })
                let storeids = [];
                storeUsers.map((store)=>{
                    storeids.push(store.storeid)
                })

                where = {
                    storeid: {
                        [Op.in] : storeids
                    }
                }
                let outlets = await StoreModel.findAll({where : where});
                resolve({ success: true, payload: outlets });
            }
            catch(e) {
                reject({ success: false, error: e, message: e.message });
            }
        })
        return promise;
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

    static getDefaultWhere()
    {
        let where = {
            isActive : 1
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