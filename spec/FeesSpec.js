var Fees = require('../src/Fees');
var _ = require('lodash');
var expected,
    result,
    sut,
    feesFile;
beforeEach(function () {
    feesFile = [
        {
            "order_item_type": "Real Property Recording",
            "fees": [
                {
                    "name": "Recording (first page)",
                    "amount": "26.00",
                    "type": "flat"
                },
                {
                    "name": "Recording (additional pages)",
                    "amount": "1.00",
                    "type": "per-page"
                }
            ],
            "distributions": [
                {
                    "name": "Recording Fee",
                    "amount": "5.00"
                },
                {
                    "name": "Records Management and Preservation Fee",
                    "amount": "10.00"
                },
                {
                    "name": "Records Archive Fee",
                    "amount": "10.00"
                },
                {
                    "name": "Courthouse Security",
                    "amount": "1.00"
                }
            ]
        },
        {
            "order_item_type": "Birth Certificate",
            "fees": [
                {
                    "name": "Birth Certificate Fees",
                    "amount": "23.00",
                    "type": "flat"
                }
            ],
            "distributions": [
                {
                    "name": "County Clerk Fee",
                    "amount": "20.00"
                },
                {
                    "name": "Vital Statistics Fee",
                    "amount": "1.00"
                },
                {
                    "name": "Vital Statistics Preservation Fee",
                    "amount": "1.00"
                }
            ]
        }
    ];
});

describe("Fees tests", function () {
    it("should flatten the fees.json and apply a post process to each fee object on distribution", function () {

        expected = {
            "Real Property Recording":
                {
                    "name": "Recording Fee",
                    "amount": "5.00"
                }
            ,
            "Birth Certificate":{
                "name": "County Clerk Fee",
                "amount": "20.00"
            }
        };
        result = Fees.flattenFees(feesFile, function(fee){
            return fee.distributions[0];
        });
        expect(result).toEqual(expected);
    });
    it("should flatten the fees.json and apply a post process on the fees array on each fee object", function(){
        sut = new Fees();
        expected = {
            "Real Property Recording":
                {
                   'flat':{
                       "name": "Recording (first page)",
                       "amount": "26.00",
                       "type": "flat"
                   },
                    'per-page':{
                        "name": "Recording (additional pages)",
                        "amount": "1.00",
                        "type": "per-page"
                    }
                }
            ,
            "Birth Certificate":{
                'flat':{
                    "name": "Birth Certificate Fees",
                    "amount": "23.00",
                    "type": "flat"
                }
            }


        };
        result = Fees.flattenFees(feesFile, function(fee){
            return _.keyBy(fee.fees, 'type');
        });
        expect(result).toEqual(expected);
    });
    it("should convert a currency value to a number", function(){
        result = Fees.convertCurrencyToNum("$1.00");
        expect(result).toBe(1);
    });

});
