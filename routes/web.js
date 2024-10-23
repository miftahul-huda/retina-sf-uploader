const CrudRouter = require("./crudrouter");

class WebRouter {

    static getConfig()
    {
        return {};
    }

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        const path = require('path');
        router.logic = logic;
        let me = this;

        router.get('', (req, res)=>{
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "index");
            res.render(p, { config: me.getConfig(), page: "users.html" } )
        });

        router.get('/user-outlets', (req, res)=>{
            var dir = __dirname;
            let sfcode = req.query.sfcode;
            console.log("SFCODE")
            console.log(sfcode)

            var p = path.resolve( dir, "../public/pages/", "index");
            res.render(p, { config: me.getConfig(), page: "user-outlets.html", sfcode: sfcode } )
        });

        router.get('/outlets', (req, res)=>{
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "index");
            res.render(p, { config: me.getConfig(), page: "outlets.html" } )
        });


        router.get('/upload-users', (req, res)=>{
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "index");
            res.render(p, { config: me.getConfig(), page: "uploader.html" } )
        });

        return router;
    }
}

module.exports = WebRouter;