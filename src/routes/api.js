const path = require('path');
const exphbs = require('express-handlebars');
const ParseServer = require('parse-server').ParseServer;

import {
	PageNotFound
} from '../handlers/public'

import {
	Login,
	Logout,
	HomePage,
	CDFileSharing,
	HandleSharedFiles
} from '../handlers/api';

const RegisterAPIRoutes = (app) => {
	const api = new ParseServer({
        databaseURI: process.env.FILE_SHARING_MONGO_URI,
        cloud: path.join(process.env.PARSE_CLOUD_CODE),
        appId: process.env.FILE_SHARING_APP_ID,
        clientKey: process.env.FILE_SHARING_CLIENT_KEY,
        masterKey: process.env.FILE_SHARING_MASTER_KEY,
        serverURL: process.env.SERVER_URL + (process.env.PARSE_MOUNT || "/parse"),
        javascriptKey: process.env.FILE_SHARING_JAVASCRIPT_KEY,
        revokeSessionOnPasswordReset: true,
        sessionLength: 60 * 1000,
        accountLockout: {
            duration: 5,
            threshold: 3
        },
        passwordPolicy: {
            resetTokenValidityDuration: 1,
        },
        liveQueryServerOptions: {
            appId: process.env.FILE_SHARING_APP_ID,
            masterKey: process.env.FILE_SHARING_MASTER_KEY,
            keyPairs: {
                clientKey: process.env.FILE_SHARING_CLIENT_KEY,
                masterKey: process.env.FILE_SHARING_MASTER_KEY
            },
            serverURL: process.env.SERVER_URL + (process.env.PARSE_MOUNT || "/parse"),
            websocketTimeout: 10000,
            cacheTimeout: 360000,
            logLevel: "VERBOSE"
        },
        allowClientClassCreation: false,
        enableSingleSchemaCache: true,
        silent: true
    });

    const mountPath = process.env.PARSE_MOUNT || '/parse';
    app.use(mountPath, api);

	// Initialize our handlebar engine
	const hbs = exphbs.create({
	    extname      :'hbs',
	    layoutsDir   : path.join(__dirname, '../public/hbs'),
	    defaultLayout: 'dashboard_main'
	});

	app.set('views', path.join(__dirname, '../public/hbs'));

	app.engine('hbs', hbs.engine);
	app.set('view engine', 'hbs');

	app.post('/', Login);
	app.post('/logout', Logout);
	app.get('/home/shared_files', HomePage);
	app.post('/home/shared_files/', HandleSharedFiles);
	app.get('/home/shared_files/*', HomePage);
	app.post('/home/shared_files/*', HandleSharedFiles);
	app.get('*', PageNotFound);
}

export default RegisterAPIRoutes;