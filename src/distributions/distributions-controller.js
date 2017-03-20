var Boom = require('boom');
var Main = require('../Orders');
var Distributions = require('../Distributions');
module.exports = {
    post: function (request, reply) {
        var orders = request.payload;
        var result = Distributions.getDistributionsFromOrders(orders);
        reply(result);
    }
};