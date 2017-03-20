var Hapi = require('hapi');
var Joi = require('joi');
var Inert = require('inert');
var Vision = require('vision');
var HapiSwagger = require('hapi-swagger');
var Good = require('good');

var options = {};

var server = new Hapi.Server();
var port = process.env.PORT || 8080;

server.connection({
    host: '0.0.0.0',
    port: port
});

server.register([
        Inert,
        Vision,
        require('./src/orders/orders-routes'),
        require('./src/distributions/distributions-routes'),
        {
            register: Good,
            options: {
                reporters: {
                    console: [{
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{log: '*', response: '*'}]
                    },
                        {
                            module: 'good-console'
                        }, 'stdout']
                }
            }
        },
        {
            register: HapiSwagger,
            options: {
                info: {
                    'title': 'Orders API Document'
                }
            }
        }],
    function (err) {
        if (err) {
            server.log(['error'], 'hapi-swagger load error: ' + err);
        }else{
            server.log(['start'], 'hapi-swagger interface loaded')
        }
        server.start(function (err) {
            if (err) {
                throw err;
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
    });