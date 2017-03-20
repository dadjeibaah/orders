(function () {
    'use strict';
    var Distributions = require('../src/Distributions');
    var mockFees, mockOrders, mockFeeDistribution;
    beforeEach(function () {
        mockOrders = [
            {
                "Order ID": "123",
                "Orders": [
                    {"Order item Real Property Recording": "$20.00"},
                    {"Order Total":"$20.00"}
                ]
            }
        ];
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
            }];
        mockFeeDistribution = {
            "Real Property Recording": [{
                "name": "Recording Fee",
                "amount": "5.00"
            }]
            ,
            "Birth Certificate": [{
                "name": "County Clerk Fee",
                "amount": "20.00"
            }]
        };
    });
    describe("Distribution tests", function () {
        it("should calculate the fund distribution for one order", function () {
            var sut, result, expected;
            expected =
                {
                    "Order ID": "123",
                    "Funds": {
                        "Fund - Recording Fee": "$5.00",
                        "Fund - Other": "$15.00"
                    }
                };
            result = Distributions.calculateFundDistribution(mockOrders[0], mockFeeDistribution);
            expect(result).toEqual(expected);
        });
        it('should distribute funds for a price based on the price distribution', function () {
            var result, distributions, expected;
            distributions = [
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
            ];
            expected = [
                {"Fund - Records Archive Fee": "$10.00"},
                {"Fund - Records Management and Preservation Fee": "$10.00"}
            ];
            result = Distributions.splitPriceOnDistribution("$20.00", distributions);
            expect(result).toEqual(expected)
        });
        it('should distribute funds for a price based on the price distribution evenly when price matches total distribution', function () {
            var result, distributions, expected;
            distributions = [
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
            ];
            expected = [
                {"Fund - Records Archive Fee": "$10.00"},
                {"Fund - Records Management and Preservation Fee": "$10.00"},
                {"Fund - Recording Fee": "$5.00"},
                {"Fund - Courthouse Security": "$1.00"}
            ];
            result = Distributions.splitPriceOnDistribution("$26.00", distributions);
            expect(result).toEqual(expected)
        });
        it('should distribute funds for a price based on the price distribution and add other fund if price is in excess', function () {
            var result, distributions, expected;
            distributions = [
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
            ];
            expected = [
                {"Fund - Records Archive Fee": "$10.00"},
                {"Fund - Records Management and Preservation Fee": "$10.00"},
                {"Fund - Recording Fee": "$5.00"},
                {"Fund - Courthouse Security": "$1.00"},
                {"Fund - Other": "$4.00"}
            ];
            result = Distributions.splitPriceOnDistribution("$30.00", distributions);
            expect(result).toEqual(expected)
        });
        it("should calculate the total fund distributions for orders", function () {
            var sut, orderDistributions, expected, result;
            sut = new Distributions();
            orderDistributions = [
                {
                    "Order ID": "123",
                    "Funds": {
                        "Fund - Recording Fee": "$5.00",
                        "Fund - Other": "$15.00"
                    }
                },
                {
                    "Order ID": "456",
                    "Funds": {
                        "Fund - Recording Fee": "$5.00",
                        "Fund - Other": "$15.00"
                    }

                }
            ];
            expected = {
                "Total distributions": {
                    "Fund - Recording Fee": "$10.00",
                    "Fund - Other": "$30.00"
                }
            };
            result = Distributions.calculateTotalFundDistributions(orderDistributions);
            expect(result).toEqual(expected);
        });
        it("should combine all fund distributions for an order", function () {
            var funds, result, expected;
            funds = [

                {"Fund - Records Archive Fee": "$10.00"},
                {"Fund - Records Management and Preservation Fee": "$10.00"},
                {"Fund - Recording Fee": "$5.00"},
                {"Fund - Courthouse Security": "$1.00"},
                {"Fund - Other": "$2.00"},
                {"Fund - Records Archive Fee": "$20.00"},
                {"Fund - Records Management and Preservation Fee": "$20.00"},
                {"Fund - Recording Fee": "$10.00"},
                {"Fund - Courthouse Security": "$2.00"},
                {"Fund - Other": "$2.00"}
            ];
            expected={
                "Fund - Records Archive Fee":"$30.00",
                "Fund - Records Management and Preservation Fee":"$30.00",
                "Fund - Recording Fee": "$15.00",
                "Fund - Courthouse Security":"$3.00",
                "Fund - Other": "$4.00"
            };
            result = Distributions.combineDistributionsForOrder(funds);
            expect(result).toEqual(expected);
        });
    });


})();