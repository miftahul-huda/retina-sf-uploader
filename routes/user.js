const CrudRouter = require('./crudrouter');

class UserRouter extends CrudRouter {

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        let me = this;

        router.get("", (req, res)=>{
            let logic = router.logic;
            logic.session = req.session;

            let offset = req.query.offset;
            let limit = req.query.limit;
            let sort = req.query.sort;

            let orderArr = me.sortToArray(sort)

            logic.findAll(null, offset, limit, orderArr ).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        });

        router.get("/find", (req, res)=>{
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;

            let offset = req.query.offset;
            let limit = req.query.limit;
            let sort = req.query.sort;
            let keyword = req.query.keyword;

            let orderArr = me.sortToArray(sort)

            logic.findByKeyword(keyword, offset, limit, orderArr ).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        });


        router.get("/:user/outlets", (req, res)=>{
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;

            let user = req.params.user;
            let offset = req.query.offset;
            let limit = req.query.limit;
            let sort = req.query.sort;
            let orderArr = me.sortToArray(sort)

            logic.findUserStores(user, offset, limit, orderArr ).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        });

        return router;
    }

    static init(req, res)
    {

    }
}

module.exports = UserRouter;