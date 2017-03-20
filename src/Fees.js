var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');
Promise.promisifyAll(fs);

var fees = function Fees() {};

function getFeesFile(fileName) {
    return fs.readFileAsync(fileName,'utf8');
}

function flattenFees(fees, postProcess){
    return _.map(fees, function (fee) {
        var newFee = {};
        newFee[fee['order_item_type']] = postProcess(fee);
        return newFee
    }).reduce(_.extend);
}

function getFeeAmounts(fees){
    return flattenFees(fees, function(fee){
        return _.keyBy(fee.fees, 'type');
    });
}

function getFeeDistributions(fees){
    return flattenFees(fees, function(fee){
        return fee.distributions;
    });
}

fees.convertNumToCurrency = function(num) {
    return '$' + num.toFixed(2);
};

fees.convertCurrencyToNum = function(currency){
    if(currency){
        return Number(currency.slice(1));
    }else return null;

};

fees.prototype.getFeesFile = getFeesFile;
fees.prototype.flattenFees = flattenFees;
fees.prototype.getFeeAmounts = getFeeAmounts;
fees.prototype.getFeeDistributions = getFeeDistributions;

module.exports = fees;