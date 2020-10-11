const path = require('path');

import User from '../utils/users';

export const LoginPage = async function (req, res) {
    try {
    	res.sendFile(path.join(__dirname, '../public/html', 'login.html'));
	} catch(error) {
		res.status(400).send(error);
	}
};

export const Test = async function (req, res) {
    try {
    	// res.sendFile(path.join(__dirname, '../public/html', 'login.html'));
    	// await User.save('sevim', 'meoowgooz74');
    	// const err = Error({test: 'test', status: });
    	res.status(200).send();
	} catch(error) {
		res.status(400).send(error);
	}
};

export const PageNotFound = function (req, res) {
	res.status(201).send('Page not found.');
}