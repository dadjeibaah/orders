var Boom = require('boom');
var Orders = require('../Orders');
module.exports = {
    post: function (request, reply) {
        var orders = request.payload;
        var result = Orders.processOrdersToFees(orders);
        reply(result);
    }
};