var Promise = require('bluebird');
var _ = require('lodash');
var Fees = require('../src/Fees');
var distributions = function Distributions() {
};

function splitPriceOnDistribution(price, distribution) {
    var numPrice, funds, index, sortedDistributions;
    numPrice = Fees.convertCurrencyToNum(price);
    sortedDistributions = _.sortBy(distribution, function (o) {
        return Number(o.amount);
    }).reverse();
    funds = [];
    while (numPrice > 0) {

        //if we have funds left to distribute and we still have distributions apply the first distribution
        if (sortedDistributions.length > 0 && numPrice - Number(sortedDistributions[0].amount) >= 0) {
            var fundAmount = Number(sortedDistributions[0].amount);
            var fund = {};
            var fundName = 'Fund - ' + sortedDistributions[0].name;
            numPrice = numPrice - Number(sortedDistributions[0].amount);
            fund[fundName] = Fees.convertNumToCurrency(fundAmount);
            sortedDistributions.shift(1);
            funds.push(fund);
        } else {
            var fund = {};
            var fundName = 'Fund - Other';
            fund[fundName] = Fees.convertNumToCurrency(numPrice);
            funds.push(fund);
            break;
        }
    }
    return funds;
}

function combineDistributionsForOrder(orderDistributions) {
    var combinedDistributions = {};
    _.forEach(orderDistributions, function (orderDistribution) {
        var keyValuePair = _.entries(orderDistribution);
        for (var index = 0; index < keyValuePair.length; index++) {
            var numCurrentValue = Fees.convertCurrencyToNum(combinedDistributions[keyValuePair[index][0]]) || 0;
            var accumValue = Fees.convertCurrencyToNum(keyValuePair[index][1]);
            combinedDistributions[keyValuePair[index][0]] = Fees.convertNumToCurrency(numCurrentValue + accumValue);
        }
    });
    return combinedDistributions;

}

function generateFundDistributionForOrderItems(order, distributions) {
    //slice everything but the total
    var orderItems = order["Orders"].slice(0,-1);
    return _.flatMap(orderItems, function (orderItem) {
        var orderType = _.mapKeys(orderItem, function (value, key) {
            return key.replace("Order item ", "");
        });
        var orderTypeKeys = _.keys(orderType);
        return splitPriceOnDistribution(orderType[orderTypeKeys[0]], distributions[orderTypeKeys[0]]);
    });
}

function calculateFundDistribution(order, distributions) {
    var fundDistribution = {};
    fundDistribution["Order ID"] = order["Order ID"];
    var orderItemDistributions = generateFundDistributionForOrderItems(order, distributions);
    var combinedDistributions = combineDistributionsForOrder(orderItemDistributions);
    fundDistribution["Funds"] = combinedDistributions;
    return fundDistribution;
}

function calculateTotalFundDistributions(fundDistributions) {
    var totalDistributions = {};
    _.forEach(fundDistributions, function (fundDistribution) {
        var keyValuePairs = _.entries(fundDistribution.Funds);
        for (var index = 0; index < keyValuePairs.length; index++) {
            var numCurrentValue = Fees.convertCurrencyToNum(totalDistributions[keyValuePairs[index][0]]) || 0;
            var accumValue = Fees.convertCurrencyToNum(keyValuePairs[index][1]);
            totalDistributions[keyValuePairs[index][0]] = Fees.convertNumToCurrency(numCurrentValue + accumValue);
        }
    });
    return {"Total distributions": totalDistributions};
}
distributions.combineDistributionsForOrder = combineDistributionsForOrder;
distributions.splitPriceOnDistribution = splitPriceOnDistribution;
distributions.calculateFundDistribution = calculateFundDistribution;
distributions.calculateTotalFundDistributions = calculateTotalFundDistributions;
module.exports = distributions;