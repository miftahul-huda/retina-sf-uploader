class AuthRouter {

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        let me = this;

        router.post("", (req, res)=>{
            let logic = router.logic;
            logic.session = req.session;

            console.log("REQ.BODY")
            console.log(req.body)

            let username = req.body.username;
            let password = req.body.password;

            logic.auth( username, password ).then(function (os)
            {
                req.session.user = os.payload;
                res.send(os);

            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        });

        return router;
    }
}

module.exports = AuthRouter;