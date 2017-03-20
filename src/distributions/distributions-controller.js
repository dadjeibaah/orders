var Boom = require('boom');
var Main = require('../Main');
module.exports = {
    post: function (request, reply) {
        var orders = request.payload;
        var result = Main.getDistributionsFromOrders(orders);
        reply(result);
    }
};