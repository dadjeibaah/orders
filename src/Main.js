'use strict';
var fs = require('fs');
var _ = require('lodash');
var prettyjson = require('prettyjson');
var Distributions = require('./Distributions');
var Fees = require('./Fees');
var Promise = require('bluebird');
var ORDER_FILE_NAME = './src/orders.json';
var FEES = './src/fees.json';
var PER_PAGE_DELIMIT = 1;
Promise.promisifyAll(fs);

var main = function main() {
};

main.prototype.run = function () {
    var distribution = new Distributions();
    var fees = new Fees();
    fs.readFileAsync(ORDER_FILE_NAME)
        .then(JSON.parse)
        .then(processOrdersToFees)
        .then(function (orders) {
            printInfo(orders);
            fees.getFeesFile(FEES)
                .then(JSON.parse)
                .then(fees.getFeeDistributions)
                .then(function(feeDistributions){
                    var fundDistributions =_.map(orders, function(order){
                        return distribution.calculateFundDistribution(order, feeDistributions);
                    });
                    fundDistributions.push(distribution.calculateTotalFundDistributions(fundDistributions));
                    return fundDistributions;
                }).then(printInfo);
        })
        .catch(printInfo);
};

function multiPageCalculation(orderItem, fees) {
    var num = [(PER_PAGE_DELIMIT * Number(fees[orderItem.type]['flat'].amount)),
        ((orderItem["pages"] - PER_PAGE_DELIMIT) * Number(fees[orderItem.type]['per-page'].amount))]
        .reduce(function (accum, value) {
            return accum + value;
        });
    return convertNumToCurrency(num);
}

function singlePageCalculation(orderItem, fees) {
    var num = [(PER_PAGE_DELIMIT * Number(fees[orderItem.type]['flat'].amount))]
        .reduce(function (accum, value) {
            return accum + value
        });
    return convertNumToCurrency(num);
}

function calculateFee(orderItems, fees) {
    return _.map(orderItems, function (orderItem) {
        var typeName, orderItemTotal = {};
        typeName = 'Order item ' +  orderItem.type;
        if (orderItem.pages > PER_PAGE_DELIMIT) {
            orderItemTotal[typeName] = multiPageCalculation(orderItem, fees);
        } else {
            orderItemTotal[typeName] = singlePageCalculation(orderItem, fees)
        }
        return orderItemTotal;
    });
}

function printInfo(info) {
    console.log(prettyjson.render(info));
}

function convertNumToCurrency(num) {
    return '$' + num.toFixed(2);
}

function calculateOrderTotal(calculatedFees) {
    var result = _.flatMap(calculatedFees, function (n) {
        return Number(_.values(n)[0].slice(1));
    }).reduce(function (accum, value) {
        return accum + value;
    });
    return {'Order Total': convertNumToCurrency(result)};
}

function processOrdersToFees(orders) {
    return fs.readFileAsync(FEES, 'utf8')
        .then(JSON.parse)
        .then(flattenFees)
        .then(function (fees) {
            return _.map(orders, function (order) {
                var calculatedFees, orderTotal, newOrder = {};
                calculatedFees = calculateFee(order["order_items"], fees);

                newOrder["Order ID"] = order["order_number"];
                newOrder["Orders"] = calculatedFees;
                calculatedFees.push(calculateOrderTotal(calculatedFees));
                return newOrder;
            })
        });

}

function flattenFees(fees) {
    return _.map(fees, function (fee) {
        var newFee = {};
        newFee[fee['order_item_type']] = _.keyBy(fee.fees, 'type');
        return newFee
    }).reduce(_.extend);

}


//main
main.prototype.calculateFee = calculateFee;
main.prototype.flattenFees = flattenFees;
main.prototype.multiPageCalculation = multiPageCalculation;
main.prototype.singlePageCalculation = singlePageCalculation;
main.prototype.calculateOrderTotal = calculateOrderTotal;
main.prototype.convertNumToCurrency = convertNumToCurrency;
main.prototype.processOrdersToFees = processOrdersToFees;

module.exports = main;
/*
 * Notes
 * - to ES6 or not ES6 that is the question
 *   Deciding NOT to ES6 since it is still in active development, wouldn't want to bring down a system due to
 *   breaking changes caused by architecture. Especially for government systems.
 * - In the convertToOrders...Function create an object first so that we can dynamically generate json property names
 * - Reading the fee file when I need it instead of loading it into memory.
 * - Future proofing the per page limit, making it an constant in case it may change to 2 pages etc. as per business rule.
 * */

/*
 * Questions
 * Part 1
 * if an order has order items that have more than one of the same type, are and the prices for all orders with
 * that same type added together?
 *   e.g. Order 1 is of type Real Property Recording has a total price, based on its pages, of value 2.00
 *        Order 2 is of type Real Property Recording has a total price, based on its pages, of value 3.00,
 *
 *        In the final output of Part 1, is there only going to be one order item of type Real Property Recording with
 *        a dollar amount 5.00?
 *   My assumption: treat each order item as its own entity there should be no overlap. You would have two entities in
 *   in the final output both of type Real Property Recording with dollar values 2.00 and 3.00 respectively.
 *
 *   Part 2
 *   Are the fund distribution applied to the order item prices we generated in part 1? or are they applied to the sum
 *   of the amounts for each type of fee in fees.json?
 *
 *
 * Can we change the order result layout slightly?
 * */
