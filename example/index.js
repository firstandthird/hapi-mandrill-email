var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 8080
});

server.register({
  register: require('../'),
  options: {
    apiKey: '1234' //Put your own key here
  }
}, function(err) {

  server.route({
    method: 'POST',
    path: '/send',
    config: {
      validate: {
        payload: {
          to: Joi.string().email().required(),
          message: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      request.server.plugins.mandrill.send({
          to: request.payload.to,
          fromEmail: 'no-reply@hapi-mandrill-error.local',
          fromName: 'hapi-mandrill-error',
          subject: 'Test email',
          text: request.payload.message
        }, function(err, result) {
          if(err) {
            return reply(Hapi.error.internal('Error sending test email', err));
          }

          reply(result);
        });
    }
  });

  server.start(function() {
    server.log(['server', 'info'], 'Hapi server started '+ server.info.uri);
  });
});
