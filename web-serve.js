/**
 * Super simple node.js server to serve the static html content, and also the
 * websocket
 */

var express = require('express');
var path = require('path');
var app = express();
var expressWs = require('express-ws')(app);
var router = express.Router();

// viewed at http://localhost:8080

/*
 * all requests to this router will first hit this logic
 */
router.use(function(req, res, next) {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
});

/*
 * Map anything that hits '/resources' to '/web/resources'
 */
router.use('/resources', express.static(path.join(__dirname + '/web/resources')));

/*
 * This will only be invoked if the path ends in /echo
 */
router.ws('/DemoWebsocketApplication/echo', function(ws, req) {
    ws.on('message', function(msg) {
        // Will just echo the message back for now
        ws.send(msg);
        console.log(msg);
    });
 });

/*
 * Any request that comes through root '/' will be served index.html
 */
router.use('/', function(req, res, next) {
    res.sendfile(__dirname + '/web/index.html');
});

app.use('/', router);

app.listen(8080);
