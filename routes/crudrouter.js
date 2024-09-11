class CrudRouter {


    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        let me = this;

        router.post('/create', function (req, res){
            me.init(req, res);
            let o = req.body;
            let logic = router.logic;
            logic.session = req.session;
        
            logic.create(o).then(function (savedO)
            {
                res.send(savedO);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })
        
        router.get('', function (req, res){
            me.init(req, res);
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
        })
        
        router.get('/find/:search', function (req, res){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let search = req.params.search;
        
            let offset = req.query.offset;
            let limit = req.query.limit;
            let sort = req.query.sort;

            let orderArr = me.sortToArray(sort)

            logic.findByKeyword(search, offset, limit, orderArr).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })


        
        router.post('/find', function (req, res){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let filter = req.body;
        
            let offset = req.query.offset;
            let limit = req.query.limit;
            let sort = req.query.sort;

            let orderArr = me.sortToArray(sort)

            logic.findByFilter(filter, offset, limit, orderArr).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })
        
        
        
        router.get('/:id', function (req, res){

            me.init(req, res);
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.get(id).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })
        
        router.put('/:id', function (req, res){

            me.init(req, res);
            let o = req.body;
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.update(id, o).then(function (savedO)
            {
                res.send(savedO);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })
        
        router.delete('/:id', function (req, res){

            me.init(req, res);
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.delete(id).then(function (result)
            {
                res.send(result);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })

        return router;
    }

    static init(){ 

    }

    static sortToArray(sort)
    {
        let order = sort;
        let orderArr = null;
        if(order != null)
        {
            orderArr = []
            let orders = order.split(";")
            orders.map((ord)=>{
                ord = ord.split(",")
                let direction = ord[1]
                if(ord[0].indexOf(".") > -1)
                {
                    let tmp = ord[0].split(".")
                    let modelName  = tmp[0]
                    let colName = tmp[1]
                    ord  = [ modelName, colName, direction ]
                    
                }
                orderArr.push(ord)
            })
        }

        return orderArr;
    }
}

module.exports = CrudRouter;
