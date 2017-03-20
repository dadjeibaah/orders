var OrdersCtrl = require('./orders-controller');
var Joi = require('joi');
exports.register = function(server, options, next){
    server.route({
       method:'POST',
       path:'/orders',
        config:{
           tags:['api'],
            validate:{
                payload:Joi.array().items(Joi.object({
                    "order_date": Joi.string(),
                    "order_number": Joi.string(),
                    "order_items": Joi.array().items(Joi.object({
                        "order_item_id": Joi.number(),
                        "type": Joi.string(),
                        "pages": Joi.number()
                    }))
                }))
            }
        },
        handler:OrdersCtrl.post
    });
    return next();
};

exports.register.attributes ={
  name:'orders-routes'
};