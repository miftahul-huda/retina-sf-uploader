const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");


class CrudLogic {

    static getModel()
    {
        return null;
    }
    
    static getPk(){
        return "id";
    }

    static totalData(search)
    {

    }

    static async create(o)
    {
        o = this.initCreate(o);

        console.log("o")
        console.log(o)

        const CurrentModel = this.getModel();

        let result = this.validateCreate(o);
        if(result.success){
            try {
                let newO = await CurrentModel.create(o);
                result.payload = newO;
                return  result;
            }
            catch(error)
            {
                throw { success: false, message: '', error: error };
            }
            
        }
        else
        {
            throw result
        }

    }

    static async findAll(where=null, offset=null, limit=null,  order=null)
    {
        try{
            const CurrentModel = this.getModel();
            
            let opt = {};
            if(offset != null)
                opt.offset = offset;
            
            if(limit != null)
                opt.limit = limit;

            if(order != null)
                opt.order = order;
            else
            {
                opt.order = this.getOrder();
            }

            let defaultWhere =  this.getDefaultWhere();
            if(defaultWhere != null)
                opt.where = defaultWhere;

            if(where != null)
                opt.where = {[Op.and]: [
                    opt.where,
                    where 
            ]}


            let includes = this.getModelIncludes();
            if(includes != null)
                opt.include = includes;
            
            let attributes = this.getDefaultAttributes();
            if(attributes != null)
                opt.attributes = attributes;
                
            let os  = await CurrentModel.findAndCountAll(opt)
            return { success: true, payload: os }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

 
    static async findByKeyword(search, offset=null, limit=null, order=null)
    {
        let where = this.getWhere(search);

        if(order == null)
            order = this.getOrder();

        try {

            let result = await this.findAll(where, offset, limit, order);
            return result
        }
        catch(error)
        {
            throw { success: false, message: '', error: error };
        }
        
    }


    static async findByFilter(filter, offset=null, limit=null, order=null)
    {
        let where = this.getWhereFromFilter(filter);

        console.log("findByFilter")
        console.dir(where, { depth: null})

        if(order == null)
            order = this.getOrder();

        try {

            let result = await this.findAll( where, offset, limit, order);
            return result
        }
        catch(error)
        {
            throw { success: false, message: '', error: error };
        }
        
    }

    static async get(id)
    {
        try{
            const CurrentModel = this.getModel();
            let pkField = this.getPk();
            let where = {};
            where[pkField] = id;

            let opt = {};
            opt.where = where;

            let includes = this.getModelIncludes();
            if(includes != null)
                opt.include = includes;

            let o  = await CurrentModel.findOne(opt);
            return { success: true, payload: o }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static async update(id,  o)
    {
        o = this.initUpdate(o);

        let result = this.validateUpdate(o);
        let pk = this.getPk();
        if(result.success){
            try {
                const CurrentModel = this.getModel();
                let where = {};
                where[pk] = id;

                let newO = await CurrentModel.update(o, { where:  where  });
                result.payload = newO;
                return  result;
            }
            catch(error)
            {
                throw { success: false, message: '', error: error };
            }
            
        }
        else
        {
            throw result
        }

    }

    static async delete(id)
    {
        try{
            let pk = this.getPk();
            const CurrentModel = this.getModel();
            let where = {};
            where[pk] = id;

            let result = await CurrentModel.destroy({ where: where });
            return { success: true, payload: result }
        }
        catch (error)
        {
            throw { success: false, message: '', error: error };
        }
    }

    static validateCreate(o){
        
        return {success :  true, message: "Succesfull"}
    }

    static validateUpdate(o)
    {   
        return {success :  true, message: "Succesfull"}
    }

    static initCreate(o)
    {
        return o;
    }

    static  initUpdate(o)
    {
        return o;
    }


    static getOrder()
    {
        return null;
    }

    static getDefaultWhere()
    {
        return null;
    }

    static getModelIncludes()
    {
        return null;
    }

    static getWhereFromFilter(filter)
    {
        console.log(filter)
        let where = {
            [Op.and]:[]
        };

        filter.map((item)=>{
            let datafield = item.datafield;
            let value = item.value;
            if(item.operand == "equal")
            {
                let w = {};
                w[item.datafield] = item.value;

                console.log("w")
                console.log(w)

                where[Op.and].push(w);

            }
            else if(item.operand == "like")
            {
                let w = null;
                let code = `w = { ${datafield} : {
                    [Op.iLike] : '%${value}%'
                }};`;

                eval(code);
                
                console.log("w")
                console.log(w)

                where[Op.and].push(w);
            }
            else if(item.operand == "between")
            {
                let w = [];
                let dts = item.value.split(" - ");
                let dt1 = dts[0];
                let dt2 = dts[1];
                let wdt1 = [];
                let wdt2 = [];

                
                wdt1[item.datafield] = {
                    [Op.gte] : dt1
                }
                wdt2[item.datafield] = {
                    [Op.lte] : dt2
                }

                let ww = {};
                ww[item.datafield] = {
                    [Op.between] : [dt1, dt2]
                }

                //ww[Op.and].push(wdt1)
                //ww[Op.and].push(wdt2)

                console.log("ww")
                console.log(ww)

                where[Op.and].push(ww);
            }
        });

        return where;
    }

    static getDefaultAttributes()
    {
        return null;
    }
}

module.exports = CrudLogic;