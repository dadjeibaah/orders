var OrdersCtrl = require('./distributions-controller');
var Joi = require('joi');
exports.register = function (server, options, next) {
    server.route({
        method: 'POST',
        path: '/distributions',
        config: {
            tags: ['api'],
            validate: {
                payload: Joi.array().items(Joi.object({
                    "Order ID": Joi.string(),
                    "Orders": Joi.array().items(Joi.object(
                        {
                            "Order item Real Property Recording": Joi.string()
                        }),Joi.object(
                        {
                            "Order item Birth Certificate": Joi.string()
                        }),
                        Joi.object(
                        {
                            "Order Total": Joi.string()
                        }))
                }))
            }
        },
        handler: OrdersCtrl.post
    });
    return next();
};

exports.register.attributes = {
    name: 'distributions-routes'
};