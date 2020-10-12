const express = require('express');
const bodyParser = require('body-parser');
const Parse = require('parse/node');
const ParseServer = require('parse-server').ParseServer;
const fs = require('fs');

import {AuthMiddleware} from './utils/requestHandler';
import RegisterAPIRoutes from './routes/api';
import RegisterPublicRoutes from './routes/public';
import RegisterParseDashboard from './routes/parse-dashboard'

// Setup the express server
const app = express();

// Avoid validating self-signed certificates in dev mode
if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Disable some stuff to make express a wee bit faster
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.disable('etag').disable('x-powered-by');

// Register the standard middleware.
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
// app.use(bodyParser({limit: '50mb'})); // Change the upload limit

Parse.initialize(process.env.FILE_SHARING_APP_ID, process.env.FILE_SHARING_JAVASCRIPT_KEY, process.env.FILE_SHARING_MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL + (process.env.PARSE_MOUNT ?? '/parse');

// Register public routes.
RegisterPublicRoutes(app);
RegisterParseDashboard(app);

// Register our middleware.
app.use(AuthMiddleware);

// Register all our routes.
RegisterAPIRoutes(app);

// Start the HTTP server.
const httpPort = process.env.HTTP_PORT || 8080;
const port = process.env.HTTPS_PORT || 8443;
// If we have SSL creds then set up an HTTPS server. Otherwise set up an HTTP one.
if (process.env.SSL_KEY && process.env.SSL_CERT && process.env.SSL_BUNDLE) {
    const httpsServer = require('https').createServer({
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
        ca: fs.readFileSync(process.env.SSL_BUNDLE)
    }, app);
    
    httpsServer.listen(port, function () {
        console.log('Server running on port ' + port + '.');
    });
} else {
    const httpServer = require('http').createServer(app);

    httpServer.listen(httpPort, function () {
        console.log('Server running on port ' + httpPort + '.');
    });
}