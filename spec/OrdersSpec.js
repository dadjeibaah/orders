(function () {
    'use strict';
    var Orders = require('../src/Orders');
    var Fees = require('../src/Fees');
    describe("Orders tests", function () {
        var mockOrderItems, mockFlattenedFees, mockFees;
        beforeEach(function () {
            mockOrderItems = [
                {
                    "order_item_id": 1,
                    "type": "Real Property Recording",
                    "pages": 3
                },
                {
                    "order_item_id": 2,
                    "type": "Real Property Recording",
                    "pages": 1
                },
                {
                    "order_item_id": 3,
                    "type": "Birth Certificate",
                    "pages": 1
                }
            ];
            mockFlattenedFees = {
                "Real Property Recording": {
                    "flat": {'amount':'26.00'},
                    "per-page": {'amount':'1.00'}
                },
                "Birth Certificate": {
                    "flat": {'amount':'26.00'}
                }
            };
            mockFees = [
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
        it("should return an order with calculated prices along with types", function () {
            var main, result, expected;
            expected = [
                {"Order item Real Property Recording": "$28.00"},
                {"Order item Real Property Recording": "$26.00"},
                {"Order item Birth Certificate": "$26.00"}
            ];
            result = Orders.calculateFee(mockOrderItems, mockFlattenedFees);
            expect(result).toEqual(expected);
        });
        it("should return a calculation based on fees for a multipage order", function(){
            var result;
            result = Orders.multiPageCalculation(mockOrderItems[0],mockFlattenedFees);
            expect(result).toBe("$28.00");
        });
        it("should return a calculation based on fees for a singlepage order", function(){
            var result;
            result = Orders.singlePageCalculation(mockOrderItems[2], mockFlattenedFees);
            expect(result).toBe("$26.00")
        });
        it("should calculate the order total for a list of order items", function(){
            var testData, expected, result;

            testData = [
                {"Order item (Real Property Recording)": "$28.00"},
                {"Order item (Real Property Recording)": "$26.00"},
                {"Order item (Birth Certificate)": "$26.00"}
            ];
            expected = {'Order Total':'$80.00'};
            result = Orders.calculateOrderTotal(testData);
            expect(result).toEqual(expected);
        });
        it("should return a dollar amount from a number", function(){
            var result;
                result = Orders.convertNumToCurrency(10);
                expect(result).toEqual('$10.00');
        });
    });
})();