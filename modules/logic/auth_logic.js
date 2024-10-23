const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");
const UserModel = require("../models/usermodel");

class AuthLogic  {

    static auth( ussername, password)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                UserModel.findOne({
                    where: {
                        [Op.and] : [
                            { email: 
                                {
                                    [Op.like]: ussername
                                }
                            }
                            ,
                            { password: 
                                {
                                    [Op.like]: password
                                }
                            }
                        ]
                    }
                }).then((user)=>{

                    if(user == null)
                    {
                        reject({
                            success: false,
                            message: "Invalid username and/or password"
                        })
                    }
                    else 
                    {
                        let o = JSON.stringify(user)
                        o = JSON.parse(o)
                        delete o.password
                        resolve({
                            success: true,
                            payload: o
                        });
                    }

                }).catch((e)=>{
                    console.log(e)
                    reject({
                        success: false,
                        message: "Cannot connect to database"
                    })           
                })
            }
            catch(e) {
                console.log(e)

                reject({
                    success: false,
                    message: "Cannot connect to database"
                })           
            }
        })
        return promise;
    }
}

module.exports = AuthLogic;