(function () {
    'use strict';
    var Main = require('../src/Main');
    describe("IndexJS tests", function () {
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
            main = new Main();
            expected = [
                {"Order item Real Property Recording": "$28.00"},
                {"Order item Real Property Recording": "$26.00"},
                {"Order item Birth Certificate": "$26.00"}
            ];
            result = main.calculateFee(mockOrderItems, mockFlattenedFees);
            expect(result).toEqual(expected);
        });

        it("should invert the details of fees to make the key the type", function () {
            var main, expected, result;
            expected = {
                "Real Property Recording": {
                    "flat": {
                        "name": 'Recording (first page)',
                        "amount":'26.00',
                        "type":"flat"
                    },
                    "per-page":{
                        'name':'Recording (additional pages)',
                        'amount':'1.00',
                        'type':'per-page'
                    }
                },
                "Birth Certificate Fees": {
                    "flat": {
                        "name": 'Birth Certificate Fees',
                        "amount":'23.00',
                        "type":"flat"
                    }
                },

            };
            main = new Main();
            result = main.flattenFees(mockFees);
            expect(result['Real Property Recording']).toEqual(expected['Real Property Recording']);
        });

        it("should return a calculation based on fees for a multipage order", function(){
            var main, result;
            main = new Main();
            result = main.multiPageCalculation(mockOrderItems[0],mockFlattenedFees);
            expect(result).toBe("$28.00");
        });
        it("should return a calculation based on fees for a singlepage order", function(){
            var main,result;
            main = new Main();
            result = main.singlePageCalculation(mockOrderItems[2], mockFlattenedFees);
            expect(result).toBe("$26.00")
        });
        it("should calculate the order total for a list of order items", function(){
            var main, testData, expected, result;
            main = new Main();
            testData = [
                {"Order item (Real Property Recording)": "$28.00"},
                {"Order item (Real Property Recording)": "$26.00"},
                {"Order item (Birth Certificate)": "$26.00"}
            ];
            expected = {'Order Total':'$80.00'};
            result = main.calculateOrderTotal(testData);
            expect(result).toEqual(expected);
        });
        it("should return a dollar amount from a number", function(){
            var main,result;
                main = new Main();
                result = main.convertNumToCurrency(10);
                expect(result).toEqual('$10.00');
        });
    });
})();