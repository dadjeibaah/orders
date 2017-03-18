var Order = require('../src/Order');
describe("Orders", function(){
    it("should print out whatever we send in", function(){
        var order = new Order();
        var param = 1;
        var result = order.calculateOrder(param);
        expect(result).toBe(param);

    });
});