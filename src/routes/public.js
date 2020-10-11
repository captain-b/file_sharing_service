const express = require('express');

import {
	LoginPage,
	Test
} from '../handlers/public'

const RegisterPublicRoutes = (app) => {
	app.use('/public', express.static(__dirname + '/../public'));

	app.get('/', LoginPage);
	app.get('/test', Test);
	
}

export default RegisterPublicRoutes;