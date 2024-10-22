var formidable = require('express-formidable')
const pubsub = require("../modules/libs/pubsub")
const ProcessStatusLogic = require("../modules/logic/processstatuslogic")

class UploadRouter {

    static getRouter(logic, Initialization=null)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        if(Initialization != null)
        {
            router.Initialization = Initialization;
        }
        let me = this;

        router.get("/status", (req, res)=>{
            let session = req.query.session;
            ProcessStatusLogic.getLatestStatus(session).then((response)=>{
                res.status(200).send(response);
            }).catch((err)=>{
                console.log("error")
                console.error(err)
                let errorCode = parseInt(err.code)
                res.status(errorCode).send(err);
            })
        })

        router.post("", formidable({ uploadDir: '/tmp' }), (req, res)=>{
            let logic = router.logic;
            logic.session = req.session;

             //Get path parameter
            let path = req.query.path;
            let removeOverheadStoreUser = req.query.rosu;


            console.log("Upload file....")
            logic.uploadFile(req, path, removeOverheadStoreUser).then(function (os)
            {
                console.log("Upload file done....")
                pubsub.publishMessage( process.env.PUBSUB_UPLOAD_XLS_DONE,
                    os.payload
                );
                
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.error(err)
                let errorCode = parseInt(err.code)
                res.status(errorCode).send(err);
            })
        });

        router.post("/convert2csv", async (req, res)=>{
            let logic = router.logic;

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }

            console.log("DATA:convert2csv")
            console.log(data)
            
            logic.convertXLStoCSV(data).then(function (os)
            {
                pubsub.publishMessage( process.env.PUBSUB_CONVERT_XLS_CSV_DONE,
                    os.payload
                );
                console.log(os)

                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

            //console.log(`File ${file.name} uploaded to bucket ${file.bucket}.`);

        });

        router.post("/save-store-user-temp", async (req, res)=>{
            let logic = router.logic;

            console.log("req.body")
            console.log(req.body)

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }

            console.log("DATA:save-store-user-temp")
            console.log(data)
            
            logic.processCSVFileAndStoreToTemp(data).then(function (os)
            {
                pubsub.publishMessage(process.env.PUBSUB_SAVE_STORE_USER_TEMP_DONE,
                    os.payload
                );
                
                console.log(os)
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

        });


        router.post("/process-store-user-temp", async (req, res)=>{
            let logic = router.logic;
            logic.Initialization = router.Initialization;

            console.log("req.body")
            console.log(req.body)

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }


            console.log("DATA:process-store-user-temp")
            console.log(data)
            
            logic.processStoreUserTemp(data).then(function (os)
            {
                pubsub.publishMessage( process.env.PUBSUB_PROCESS_STORE_USER_TEMP_DONE,
                    os.payload
                );
                
                console.log(os)
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

        });

        router.post("/transfer-from-temporary", async (req, res)=>{
            let logic = router.logic;

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }


            console.log("DATA:transfer-from-temporary")
            console.log(data)
            
            logic.moveAllToRealTables(data).then(function (os)
            {
                
                pubsub.publishMessage(process.env.PUBSUB_TRANSFER_FROM_TEMPORARY_DONE,
                    os.payload
                );
                
                
                console.log(os)
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

        });


        router.post("/dump-new-users", async (req, res)=>{
            let logic = router.logic;

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }


            console.log("DATA:dump-new-users")
            console.log(data)
            
            logic.downloadNewUsers(data).then(function (os)
            {
                /*
                pubsub.publishMessage("projects/telkomsel-retail-intelligence/topics/dump-new-users-done",
                    os.payload
                );
                */
               
                console.log(os)
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

        });


        router.post("/done", async (req, res)=>{
            let logic = router.logic;

            console.log("req.body")
            console.log(req.body)

            let message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
            let data = message

            try
            {
                data = JSON.parse(data);
                data = data.message;
            }
            catch(e)
            {
                console.log(e)
            }
            
            logic.done(data).then(function (os)
            {
                console.log(os)
                res.status(200).send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                let errorCode = parseInt(err.code)
                res.status(200).send(err);
            })

        });


 

        return router;
    }
}

module.exports = UploadRouter;