const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");

class ProcessStatusLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/processstatusmodel");
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
                    session : {
                        [Op.like] : "%" + search + "%"
                    } 
                }
                ,
                {
                    1:1
                }
            ]
            
        }
        return where;
    }

    static getOrder()
    {
        let order = [['session', 'ASC']];
        return order;
    }

    static getLatestStatus(session)
    {
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 
                let model = this.getModel();
                let oStatus = await model.findOne({ 
                    where: {
                        session: session
                    }
                    ,
                    order: [[
                        'createdAt', 'DESC'
                    ]]
                })
                resolve({
                    status: "success",
                    code: 200,
                    payload: oStatus
                });
            }
            catch(e) {
                reject({
                    status: "fail",
                    code: 500,
                    error_code: "GET_LATEST_STATUS",
                    message: "Get Latest status fail",
                    payload: e
                });
            }
        })
        return promise;
    }
}

module.exports = ProcessStatusLogic;