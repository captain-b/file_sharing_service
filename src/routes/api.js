const path = require('path');
const exphbs = require('express-handlebars');

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