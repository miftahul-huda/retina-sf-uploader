const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");
const GCS = require("../libs/gcs"); 
var path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const Util = require("../libs/util");
const session = require('express-session');
const ProcessStatusLogic = require("./processstatuslogic");
const { error } = require('console');
const StoreUserTempModel = require('../models/storeusertempmodel');

const moment = require('moment'); // Make sure you have Moment.js installed
const { convertArrayToCSV } = require('convert-array-to-csv');


class UploadLogic {


    static getModel()
    {
        const model = require("../models/uploadhistorymodel");
        return model;
    }
    //Public Function : uploadFile
    static uploadFile(req, targetPath, rosu )
    {
        let promise = new Promise(async (resolve, reject)=>{

            let requestID = "req-" + Util.random_str(10)
            let sessionID = "ses-" + Util.random_str(10);
            await ProcessStatusLogic.create({
                session: sessionID,
                message: "Uploading file to GCS...",
                status: "On Progress"
            })

            if(targetPath == null || targetPath.length == 0)
            {
                await ProcessStatusLogic.create({
                    session: sessionID,
                    message: "Uploading file to GCS failed. No path parameter supplied.",
                    status: "Error"
                })
                reject({ status: "fail", message: "No path parameter supplied. Should provide path parameter. /?path=<path>" })
            }
            else
            {

                //Get keys from the req.files
                let keys = Object.keys(req.files)
                
                //Iterate each files
                keys.map((key)=>{

                    //Get filenames informations
                    let filenameInfo = UploadLogic.getFilenames(req, key, targetPath);
                    console.log("UploadFile")
                    console.log(filenameInfo)

                    GCS.upload(filenameInfo.bucket, filenameInfo.temporaryFile, filenameInfo.outputFilename ).then(async (response)=>{
                        filenameInfo.session = sessionID

                        await ProcessStatusLogic.create({
                            session: sessionID,
                            message: "Uploading file to GCS is successfull",
                            status: "Success"
                        })

                        filenameInfo.rosu = rosu;
                        resolve({ requestID: requestID, status: "success", code: "200", payload: filenameInfo })
                   
                    }).catch(async (e)=>{

                        await ProcessStatusLogic.create({
                            session: sessionID,
                            message: "Uploading file to GCS failed",
                            status: "Fail"                        
                        })

                        reject({ requestID: requestID,  status: "fail", code: '500', source:"GCSLogic.uploadFile", error_code: "UPLOAD_FAIL", message: "Upload Fail", error: e});
                    })


                })
            }

        });

        return promise;
    }

    static convertXLStoCSV(data)
    {
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 
                console.log("convertXLStoCSV.DATA")
                console.log(data)

                let requestID = "req-" + Util.random_str(10)


                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Converting to CSV",
                    status: "On Progress"
                })

                let randStr = Util.random_str(10);
                let tmpXLSfilename = randStr + "." + data.ext;
                let tmpXLSfilenamePath = "/tmp/" +tmpXLSfilename;
                let tmpCSVilenamePath = tmpXLSfilenamePath.replace( data.ext, ".csv");
                let csvUploadedFilepath = data.outputFilename.replace(data.ext, ".csv");
                console.log("csvUploadedFilepath")
                console.log(csvUploadedFilepath)

                
                GCS.downloadFile(data.bucket, data.outputFilename, tmpXLSfilenamePath ).then(()=>{
                   
                    console.log("convert to CSV")
                    UploadLogic.convertToCsv(tmpXLSfilenamePath, tmpCSVilenamePath);
                    GCS.upload(data.bucket, tmpCSVilenamePath, csvUploadedFilepath).then(async()=>{
                        
                        await ProcessStatusLogic.create({
                            session: data.session,
                            message: "Converting to CSV is successfull.",
                            status: "Success"
                        })

                        resolve({
                            requestID: requestID,
                            status: "success",
                            code: "200",
                            payload: {
                                session: data.session,
                                bucket: data.bucket,
                                outputFilename: csvUploadedFilepath,
                                ext: "csv",
                                rosu: data.rosu
                            }
                        });

                    }).catch(async (e) =>{
                        console.log("ERROR")
                        console.log(e)

                        await ProcessStatusLogic.create({
                            session: data.session,
                            message: "Converting to CSV failed.",
                            status: "Error"
                        })

                        reject({
                            requestID: requestID,
                            status: "fail",
                            code: 505,
                            message: "Upload to gcs fail",
                            error_code: "GCS_UPLOAD_FAIL",
                            payload: {
                                session: data.session,
                                bucket: data.bucket,
                                outputFilename: csvUploadedFilepath,
                                ext: "csv"
                            }
                        })
                    })
                    
                })

            }
            catch(e) {
                console.error(e)
                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Converting to CSV failed.",
                    status: "Error"
                })
                reject({ requestID: requestID, code: 500, message: "error convert to csv" });
            }
        })
        return promise;

    }

    static processCSVFileAndStoreToTemp(data)
    {
        console.log("ProcessCSVFile...")
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 

                let requestID = "req-" + Util.random_str(10)

                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Processing CSV File is starting. Downloading CSV file from GCS...",
                    status: "On Progress"
                })

                let tmpCSVilenamePath = "/tmp/" + data.session + "." + data.ext;
                GCS.downloadFile(data.bucket, data.outputFilename, tmpCSVilenamePath).then(async()=>{
                    

                    await ProcessStatusLogic.create({
                        session: data.session,
                        message: "Downloading CSV file from GCS is successfull.",
                        status: "Success"
                    })

                    await ProcessStatusLogic.create({
                        session: data.session,
                        message: "Processing CSV File...",
                        status: "On Progress"
                    })

                    UploadLogic.processCSVFileMore(tmpCSVilenamePath, data.session).then(async(items)=>{
                        let res = { session : data.session, totalData: items.length };


                        await ProcessStatusLogic.create({
                            session: data.session,
                            message: "Processing CSV File is successfull.",
                            status: "Success"
                        })

                        res.rosu = data.rosu;
                        res.bucket = data.bucket;
                        res.outputFilename = data.outputFilename;

                        resolve({
                            requestID: requestID,
                            status: "success",
                            code: 200,
                            payload: res
                        });
                    }).catch(async(e)=>{

                        if(e.error_code == "CSV_HEADER_INCOMPLETE")
                        {
                            await ProcessStatusLogic.create({
                                session: data.session,
                                message: "Data Header is incomplete or invalid. " + e.message,
                                status: "Error"
                            })
                        }
                        else
                        {

                            await ProcessStatusLogic.create({
                                session: data.session,
                                message: "Processing CSV File failed.",
                                status: "Error"
                            })

                        }


                        reject({
                            requestID: requestID,
                            status: "fail",
                            code: 500,
                            message: "Processing csv file failed.",
                            data: e
                        })
                    })

                }).catch(async (e) =>{

                    await ProcessStatusLogic.create({
                        session: data.session,
                        message: "Processing CSV File error because downloading it from GCS failed.",
                        status: "Error"
                    })

                    reject({
                        requestID: requestID,
                        status: "fail",
                        code: 500,
                        message: "Processing CSV File failed. Downloading csv file failed.",
                        data: e
                    })
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static processCSVFileMore(csvFile, session)
    {
        let promise =  new Promise(async(resolve, reject)=>{
            try{ 
                Util.read_csv(csvFile).then(async( dt )=>{
                    let o = dt[0];

                    //Check CSV header
                    let doesnExists = UploadLogic.checkCsvHeader(o);

                    //IF header incomplete reject
                    if(doesnExists.length > 0)
                    {


                        let myString = doesnExists.join(", ");
                        reject({ type: "error", 
                            error_code: "CSV_HEADER_INCOMPLETE", 
                            data: doesnExists , 
                            message: "'" + myString + "' does not exist in header."  
                        })
                    }
                    else
                    {
                        await ProcessStatusLogic.create({
                            session: session,
                            message: "Saving to temporary table....",
                            status: "On Progress"
                        })

                        UploadLogic.storeToTemporaryDatabase(dt,  session).then(async(items)=>{
                            await ProcessStatusLogic.create({
                                session: session,
                                message: "Saving to temporary table is successfull.",
                                status: "Success"
                            })
                            resolve(items);
                        }).catch(async(e)=>{
                            await ProcessStatusLogic.create({
                                session: session,
                                message: "Processing CSV File error because saving to temporary table failed.",
                                status: "Error"
                            })
                            reject({ type: "error", error_code: "STORE_USER_TEMP_SAVE_ERROR", data:e, message: "Store User Temporary saving to database failed." });
                        })
                    }
                })
            }
            catch(e) {
                reject({ type: "error", error_code: "UNKNOWN", data:e, message: "" });
            }
        })
        return promise;
    }

    static storeToTemporaryDatabase(data, session)
    {
        let promise =  new Promise(async(resolve, reject)=>{
            try{ 
                let storeUserTemps = UploadLogic.getStoreUserTemps(data, session);
                await StoreUserTempModel.bulkCreate(storeUserTemps)
                resolve(storeUserTemps);
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }


    //============ Processs store_user_temporary ==========
    static processStoreUserTemp(data)
    {
        let promise =  new Promise(async(resolve, reject)=>{
            try
            { 
                let requestID = "req-" + Util.random_str(10)

                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Adding Outlets, Users, and User Outlets is processing....",
                    status: "On Progress"
                })

                if(data.rosu != null)
                    if(data.rosu == 'false')
                        data.rosu = false;
                    else
                        data.rosu = true;

                this.setStoreUserTempUsername(data).then(()=>{
                    this.addNewStores(data).then(()=>{
                        this.addNewUsers(data).then(()=>{
                            this.createUsernameAndPasswordForUser(data).then(()=>{
                                this.setStoreUserTempUsernameFromUserTemp(data).then(()=>{
                                    this.storeUserTemporaryToStoreUser(data).then(()=>{
                                        this.setStoreUsersInactiveStore(data).then(()=>{
                                            this.setStoreUsersInactiveUser(data).then(async(res)=>{
        
                                                await ProcessStatusLogic.create({
                                                    session: data.session,
                                                    message: "Adding Outlets, Users, and User Outlets is successfull.",
                                                    status: "Success"
                                                })


        
                                                resolve({
                                                    requestID: requestID,
                                                    status: "success",
                                                    code: 200,
                                                    payload: data
                                                });

                                            }).catch((e)=>{
                                                reject(e);
                                            })
                                        }).catch((e)=>{
                                            reject(e);
                                        })

                                    }).catch((e)=>{
                                        reject(e);
                                    })

                                }).catch((e)=>{
                                    reject(e);
                                })

                            }).catch((e)=>{
                                reject(e);
                            })

                        }).catch((e)=>{
                            reject(e);
                        })
                    }).catch((e)=>{
                        reject(e);
                    })
                }).catch((e)=>{
                    reject(e);
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static setStoreUserTempUsername(data)
    {
        //Set Username from authentication.user, the non existing user will have no usernames and password
        const sqlQuery = `UPDATE store_user_temporary
                            SET username = t1.email, "password" = t1."password"
                            FROM dblink('host=${process.env.AUTH_DBHOST} user=nodeuser password=rotikeju98 dbname=authentication', 
                                        'SELECT sfcode, email, "password" FROM "user"') AS t1 (sfcode text, email text, "password" text)
                            WHERE store_user_temporary.sfcode = t1.sfcode 
                            and store_user_temporary.tag like '${data.session}';`;
        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.setStoreUserTempUsername()")
    }


    static setStoreUserTempUsernameFromUserTemp(data)
    {
        //Set Username from authentication.user, the non existing user will have no usernames and password
        const sqlQuery = `UPDATE store_user_temporary
                            SET username = t1.email, "password" = t1."password"
                            FROM user_temp t1
                            WHERE store_user_temporary.sfcode = t1.sfcode 
                            and store_user_temporary.tag like '${data.session}';`;

        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.setStoreUserTempUsername()")
    }

    static storeUserTemporaryToStoreUser(data)
    {
        const sqlQuery = `INSERT INTO store_user_testing (sfcode, username, storeid, store_name, tag, "createdAt", "isActive")
                                SELECT sfcode, username, storeid, store_name, tag, NOW(), 1
                                FROM store_user_temporary
                                WHERE tag like '${data.session}'
                            ;`;

        return this.runQuery(sqlQuery, QueryTypes.INSERT, data, "UploadLogic.storeUserTemporaryToStoreUser()")

    }

    /*
    static setStoreUserTempUsernameNonExistence(data)
    {
        const sqlQuery = `update "store_user_temporary" set 
                username = create_username(sfcode), 
                "password" = random_string(8)
                where 
                tag like '${data.session}'
                    and
                username is null`;

        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.setStoreUserTempUsernameNonExistence()")
    }
    */

    static addNewStores(data)
    {
                        //Set Username from authentication.user
        const sqlQuery = `INSERT INTO store_temp (storeid, store_name, 
                            store_branch, store_cluster, store_region, 
                            store_area, store_city, tag, archetype, "createdAt", "isActive") 
                      SELECT st.storeid, st.store_name, 
                        st.store_branch, st.store_cluster, st.store_region, 
                        st.store_area, st.store_city, st.tag, st.archetype, NOW(), 1
                      FROM store_user_temporary st
                      WHERE st.tag like '${data.session}'
                        AND
                      st.storeid NOT IN 
                        (
                            SELECT storeid FROM store where 
                            tag is not null and "isActive" = 1
                        )
                      `;
        return this.runQuery(sqlQuery, QueryTypes.INSERT, data, "UploadLogic.addNewStores()")
    }

    static addNewUsers(data)
    {
        //Add new users where the users is not in authentication.user database.
        const sqlQuery = `INSERT INTO user_temp (sfcode, email, firstname, tag, "createdAt", "isActive")
                            SELECT distinct st.sfcode, st.username, 
                            st.name, st.tag, NOW(), 1                                  
                            FROM store_user_temporary st
                            WHERE st.tag like '${data.session}'
                            AND
                            st.sfcode NOT IN 
                            (
                                SELECT sfcode FROM
                                    dblink('host=${process.env.AUTH_DBHOST} user=nodeuser password=rotikeju98 dbname=authentication', 
                                        'SELECT sfcode FROM "user"') AS t1 (sfcode text)
                            )
                            `;

        return this.runQuery(sqlQuery, QueryTypes.INSERT, data, "UploadLogic.addNewUsers()")
    }

    static createUsernameAndPasswordForUser(data)
    {
        //Create username and password for users that dont exists in authentication database.
        //These users have no email and password.
        const sqlQuery = `UPDATE user_temp 
                                SET email = create_username(sfcode),
                                "password" = random_string(8)
                            WHERE
                                tag like '${data.session}'
                                and
                                email is null
                            `;

        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.createUsernameAndPasswordForUser()")
    }

    static setStoreUsersInactiveStore(data)
    {
        let sqlQuery = `UPDATE store_user_testing set "isActive" = 0 where
                            storeid in
                            (
                                select storeid from store_user_temporary
                                where tag like '${data.session}'
                            )
                            and
                            tag not like '${data.session}'
                        `;

        console.log("data.rosu")
        console.log(data.rosu)

        if(data.rosu == false)
            sqlQuery = "SELECT 1";

        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.setStoreUsersInactiveStore()")
    }

    static setStoreUsersInactiveUser(data)
    {
        let sqlQuery = `UPDATE store_user_testing set "isActive" = 0 where
                        sfcode in
                        (
                            select sfcode from store_user_temporary
                            where tag like '${data.session}'
                        )
                        and
                        tag not like '${data.session}'
                    `;


        console.log("data.rosu")
        console.log(data.rosu)

        if(data.rosu == false)
            sqlQuery = "SELECT 1";
        return this.runQuery(sqlQuery, QueryTypes.UPDATE, data, "UploadLogic.setStoreUsersInactiveUser()")

    }

    static addNewStoreUsers(data)
    {
        const sqlQuery = `INSERT INTO store_user_testing (sfcode, username, storeid, store_name, tag, "createdAt", "isActive")
                                  SELECT st.sfcode, st.username, st.storeid,
                                    st.store_name, st.tag, NOW(), 1                                 
                                  FROM store_user_temporary st
                                  WHERE st.tag like '${data.session}'
                                  `;
                
        return this.runQuery(sqlQuery, QueryTypes.INSERT, data, "UploadLogic.addNewStoreUsers()")
    }

    static moveAllToRealTables(data)
    {
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 

                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Transfering data from temporary...",
                    status: "On Process"
                })

                let sql = `INSERT INTO "user" (sfcode, email, "password", firstname, tag, "createdAt", "isActive")
                    SELECT st.sfcode, 
                        st.email, 
                        st."password",
                    	st.firstname, 
						st.tag, 
						st."createdAt", 
						1                                  
                    FROM dblink('host=${process.env.DBHOST} user=nodeuser password=rotikeju98 dbname=retail-intelligence', 
                    'SELECT sfcode, firstname, email, "password", tag, "createdAt" FROM "user_temp" 
                    WHERE tag like ''${data.session}''') 
					AS 
						st (sfcode text, firstname text, email text, "password" text, tag text, "createdAt" date)
                `;

                let initialization = this.Initialization;
                let sequelizeAuth = initialization.sequelizeAuth;
                this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()", sequelizeAuth).then(()=>{

                    sql = `INSERT INTO "user" (sfcode, email, firstname, tag, "createdAt", "isActive")
                    SELECT distinct st.sfcode, st.email, 
                        st.firstname, st.tag, st."createdAt", 1                                  
                    FROM user_temp st
                    WHERE 
                        st.tag like '${data.session}'
                        AND
                        st.sfcode not in
                        (
                            select sfcode from "user" where "isActive" = 1
                        )
                    `;

                    this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()").then(()=>{


                        sql = `INSERT INTO store (storeid, store_name, 
                            store_branch, store_cluster, store_region, 
                            store_area, store_city, tag, archetype, "createdAt", "isActive") 
                            SELECT st.storeid, st.store_name, 
                                st.store_branch, st.store_cluster, st.store_region, 
                                st.store_area, st.store_city, st.tag, st.archetype, st."createdAt", 1
                            FROM store_temp st
                            WHERE st.tag like '${data.session}'
                            `;
                        
                        this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()").then(async ()=>{

                            sql = `INSERT INTO store_user (sfcode, username, storeid, store_name, tag, "createdAt", "isActive")
                                SELECT sfcode, username, storeid, store_name, tag, "createdAt", 1
                                FROM store_user_testing
                                WHERE tag like '${data.session}'
                                ;`;

                            if(data.rosu)
                            {
                                this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()").then(()=>{

                                    sql = `UPDATE store_user set "isActive" = 0 where
                                            sfcode in
                                            (
                                                select sfcode from store_user_testing
                                                where tag like '${data.session}'
                                            )
                                            and
                                            tag not like '${data.session}'
                                        `;
                                    this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()").then(()=>{
                                        
                                        sql = `UPDATE store_user set "isActive" = 0 where
                                                storeid in
                                                (
                                                    select storeid from store_user_testing
                                                    where tag like '${data.session}'
                                                )
                                                and
                                                tag not like '${data.session}'
                                            `;
                                        
                                        this.runQuery(sql, QueryTypes.INSERT, data, "moveAllToRealTables()").then(async()=>{
                                            //resolve();

                                            await ProcessStatusLogic.create({
                                                session: data.session,
                                                message: "Transfering data from temporary is successfull",
                                                status: "Success"
                                            })


                                            let requestID = "req-" + Util.random_str(10)
                                            resolve({
                                                requestID: requestID,
                                                status: "success",
                                                code: 200,
                                                payload: data
                                            });

                                        }).catch((e)=>{
                                            reject(e)
                                        })
                                        
                                    }).catch((e)=>{
                                        reject(e)
                                    })
    
                                }).catch((e)=>{
                                    reject(e)
                                })

                            }
                            else
                            {
                                await ProcessStatusLogic.create({
                                    session: data.session,
                                    message: "Transfering data from temporary is successfull",
                                    status: "Success"
                                })

                                let requestID = "req-" + Util.random_str(10)
                                resolve({
                                    requestID: requestID,
                                    status: "success",
                                    code: 200,
                                    payload: data
                                });
                            }
                            
                        }).catch((e)=>{
                            reject(e)
                        })

                    }).catch((e)=>{
                        reject(e)
                    })
                }).catch((e)=>{
                    reject(e)
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static runQuery(query, qtype, data, source, sequelize = null)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                //Gete sequelize
                if(sequelize == null)
                {
                    let Initialization = this.Initialization;
                    sequelize = Initialization.sequelize;
                }

                //Set Username from authentication.user
                const sqlQuery = query;
                
                sequelize.query(sqlQuery, {
                    type: qtype 
                })
                .then((dt) => {
                    resolve(dt);
                })
                .catch(err => {
                    console.error('Error executing raw query:', err);
                    reject({
                        code: 505,
                        source: source,
                        error_code: "ERROR_EXECUTING_QUERY",
                        message: "Error executing raw query",
                        payload: {
                            session: data.session,
                            error: err
                        }
                    })
                });
            }
            catch(e) {
                console.error('Error executing raw query:', e);

                reject({
                    code: 505,
                    error_code: "UNKNOWN_ERROR",
                    source: source,
                    message: "Unknown",
                    payload: {
                        session: data.session,
                        error: e
                    }
                });
            }
        })
        return promise;     
    }


    //------------- Dump new users ---------------
    static downloadNewUsers(data)
    {
        let promise =  new Promise(async (resolve, reject)=>{
            try{ 

                await ProcessStatusLogic.create({
                    session: data.session,
                    message: "Dumping new user data..",
                    status: "On Process"
                })

                let users = this.getNewUsers(data).then((users)=>{
                    console.log(users)
                    let tmpFilename = data.session + ".xlsx";
                    let tmpFilePath = "/tmp/" + tmpFilename;
                    let uploadPath = data.outputFilename;
                    uploadPath  = path.dirname(uploadPath)
                    uploadPath += "/" + tmpFilename;

                    this.objects2xlsx(users, tmpFilePath);


                    GCS.upload(data.bucket, tmpFilePath, uploadPath).then(async ()=>{
                        
                        let requestID = "req-" + Util.random_str(8);

                        await ProcessStatusLogic.create({
                            session: data.session,
                            message: "Process done successfully",
                            data: JSON.stringify({
                                output: "gs://" + data.bucket + "" + uploadPath
                            }),
                            status: "Finish"
                        })

                        resolve({
                            requestID: requestID,
                            status: "success",
                            code: 200,
                            payload: data
                        });

                    }).catch((e)=>{
                        reject(e)
                    })

                }).catch((e)=>{
                    reject(e)
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static getNewUsers(data)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                const sqlQuery = `SELECT distinct sfcode, name, username, "password"                                 
                FROM "store_user_temporary"
                where 
                tag like '${data.session}'
                `;

                this.runQuery(sqlQuery, QueryTypes.SELECT, data, "UploadLogic.downloadNewUsers()").then((users)=>{                    
                    resolve(users);
                }).catch((e)=>{
                    reject( e);
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;

    }

    static done(data)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                resolve();
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static setUsernameForStoreUserTemporary(data, session)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                resolve();
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

    static getStoreUserTemps(data, session)
    {
        console.log("getStoreUserTemps()")
        console.log(data)
        let tag = session; // + " - " + moment(Date.now()).format("YYYY-MM-DD");
        let storeUserTemps = [];
        data.forEach((item)=>{
            let o = {};
            o.storeid = item.id_outlet;
            o.store_name = item.nama_outlet;
            o.store_cluster = item.cluster;
            o.store_branch = item.branch;
            o.store_region = item.region;
            o.store_area = item.area;
            o.store_city = item.city;
            o.sfcode = item.sf_code;
            o.name = item.nama;
            o.tag = tag;
            o.archetype = item.archetype;
            storeUserTemps.push(o)
        })

        return storeUserTemps;
    }

    static checkCsvHeader(o)
    {
        let doesnExists = [];
        let result= true;
        let columns = ["sf_code", "nama", "id_outlet", "nama_outlet", "cluster", "branch", "city", "area", "region", "archetype" ]
        let props = Object.keys(o)

        console.log("=============props==========")
        console.log(props)

        columns.forEach((elm)=>{
            let exists = Util.includesIgnoreCase(props, elm)
            if(exists == false)
            {
                doesnExists.push(elm)
                result = false;
            }
        })

        return doesnExists;
    }

    

    static convertToCsv(filename, output)
    {
        // Load the Excel file
        const workbook = xlsx.readFile(filename);

        // Select the first sheet (you can adjust this if needed)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to CSV
        const csv = xlsx.utils.sheet_to_csv(worksheet);

        // Write the CSV to a file
        fs.writeFileSync(output, csv);

        return output;
    }

    static objects2xlsx(data, output)
    {
       // Create a new workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);
        
        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
        //  Define the range for the table (e.g., A1:C4)
        let totcols = Object.keys(data[0]).length;
        const range = { s: { c: 0, r: 0 }, e: { c: totcols-1, r: data.length } }; 
        
        // Add the table to the worksheet
        worksheet['!ref'] = xlsx.utils.encode_range(range); // Set the range of the worksheet to match the table
        xlsx.utils.sheet_add_aoa(worksheet, [Object.keys(data[0])], { origin: 'A1' }); // Add header row
        worksheet['!table'] = {
            name: 'MyTable', // Name of the table
            ref: range, // Range of the table
            displayName: 'MyTable', // Display name (can be different from the actual name)
            headerRow: true, // Indicate that the first row is a header
            totalsRow: false, // Set to true if you have a totals row
            style: 'TableStyleMedium2' // Choose a table style (optional)
        };
        
        // Write the workbook to a file
        xlsx.writeFile(workbook, output); 
    }

    static getFilenames(req, key, targetPath)
    {
        //Get bucket from targetPath
        targetPath = targetPath.replace("gs://", "")

        let bucket = targetPath.split("/")
        //console.log("bucket")
        //console.log(bucket)
        bucket = bucket[0]

        let targetFilename = targetPath.split("/")
        targetFilename = targetFilename[targetFilename.length - 1]
        if(targetFilename.indexOf(".") == -1)
        {
            targetFilename = null;
        }


        //Get uploaded filename and its extension
        let originalFilename = req.files[key].name;
        let ext = path.extname(originalFilename).toLowerCase();
        ext = ext.replace(".", "")

        //Get the uploaded temporary filename
        let inputFile = req.files[key].path;

        //Get the output filename, use targetfilename if it exists
        let outputFilename = originalFilename;
        if(targetFilename != null && targetFilename.length > 0)
        {
            outputFilename = targetFilename;
        }

        //set path  of the output filename
        let gcsFolder = targetPath.replace( bucket, ""); 
        if(targetFilename != null && targetFilename.length > 0)
        {
            gcsFolder = gcsFolder.replace("/" + targetFilename, "");
        }              
        outputFilename = gcsFolder + '/' + outputFilename;


        return { originalFilename: originalFilename, temporaryFile: inputFile, ext: ext, bucket: bucket, outputFilename: outputFilename }
    }

    static downloadFile(url)
    {
        let promise =  new Promise((resolve, reject)=>{
            try{ 
                url = url.replace("gs://", "")
                let urls = url.split("/")
                let bucket = urls[0]
                let filepath = url.replace(bucket, "");
                let filename = path.basename(filepath);
                let outputFilepath = "/tmp/" + filename;
                console.log("bucket")
                console.log(bucket)

                //console.log()
        
                GCS.downloadFile(bucket, filepath, outputFilepath).then((f)=>{
                    resolve(f);
                }).catch((e)=>{
                    reject(e)
                })
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;
    }

}

module.exports = UploadLogic;