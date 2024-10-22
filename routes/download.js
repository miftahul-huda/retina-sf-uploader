const CrudRouter = require("./crudrouter");
const fs = require('fs');
const path = require("path")


class DownloadRouter{

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        let me = this;

        router.get("", (req, res)=>{
            let logic = router.logic;
            logic.session = req.session;

            let url = req.query.url;
            logic.downloadFile( url).then(function (f)
            {
                let fname = path.basename(f)
                // Read the file
                fs.readFile(f, (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error loading file');
                        return;
                    }

                    // Set the appropriate Content-Type header for Excel files
                    res.writeHead(200, { 
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'Content-Disposition': 'attachment; filename="' + fname + '"'
                    }); 

                    // Send the file data
                    res.end(data);
                });

            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        });



        return router;
    }
}

module.exports = DownloadRouter;