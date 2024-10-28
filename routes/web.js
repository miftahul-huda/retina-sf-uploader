const CrudRouter = require("./crudrouter");

class WebRouter {

    static getConfig()
    {
        return { environment: process.env.ENVIRONMENT };
    }

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        const path = require('path');
        router.logic = logic;
        let me = this;

        router.get('', (req, res)=>{
            if(req.session.user == null)
            {
                res.redirect("/login")
            }
            else
            {

                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "index");
                res.render(p, { config: me.getConfig(), page: "users.html" } )
            }

        });

        router.get('/user-outlets', (req, res)=>{
            var dir = __dirname;
            let sfcode = req.query.sfcode;
            console.log("SFCODE")
            console.log(sfcode)
            if(req.session.user == null)
            {
                res.redirect("/login")
            }
            else
            {
                var p = path.resolve( dir, "../public/pages/", "index");
                res.render(p, { config: me.getConfig(), page: "user-outlets.html", sfcode: sfcode } )
            }

        });

        router.get('/outlets', (req, res)=>{
            if(req.session.user == null)
            {
                res.redirect("/login")
            }
            else
            {
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "index");
                res.render(p, { config: me.getConfig(), page: "outlets.html" } )
            }

        });


        router.get('/upload-users', (req, res)=>{
            if(req.session.user == null)
            {
                res.redirect("/login")
            }
            else 
            {
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "index");
                res.render(p, { config: me.getConfig(), page: "uploader.html" })
            }
        });

        router.get('/login', (req, res)=>{
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "login");
            res.render(p, { config: me.getConfig() } )
        });

        router.get('/logout', (req, res)=>{
            req.session.user = null;
            res.redirect("/login")
        });

        return router;
    }
}

module.exports = WebRouter;