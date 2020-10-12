const fs = require('fs').promises;
const fsSync = require('fs');
const Parse = require('parse/node');

const userClass = Parse.Object.extend('_User');

// import User from '../utils/users';
import SharedFiles from '../utils/fileHandler';

export const Login = async function (req, res) {
    try {
    	const user = await Parse.User.logIn(req.body.username, req.body.password);
		res.cookie('token', `Bearer ${user.attributes.sessionToken}`).send('/home/shared_files');
	} catch(error) {
		console.log(error);
		res.status(401).send('Authentication failed.');
	}
};

export const Logout = async function (req, res) {
	res.cookie('token', '').send();
}

export const HomePage = async function (req, res) {
    try {
    	const paths = req.url.split('/');
    	paths.shift();
    	paths.shift();

    	var fullPath = '';

    	if (paths.length !== 1 && paths[paths.length - 1].includes('.')) {
    		paths.forEach(function(path, i) {
	    		if (i !== 0) {
	    			fullPath += path.replace(/%20/g, '\ ') + '/';
	    		}
	    	});

    		return res.download(`${process.env.SHARED_DIR}/${fullPath}`);
    	}

    	paths.forEach(function(path, i) {
    		if (i !== 0) {
    			fullPath += path.replace(/%20/g, '\ ') + '/';
    		}
    	});

    	const sharedFiles = await fs.readdir(process.env.SHARED_DIR + '/' + fullPath);

    	if (sharedFiles[0] === '.DS_Store')
    		sharedFiles.shift(); // Remove '.DS_Store'
    	
    	var files = [];

    	sharedFiles.forEach(function(file) {

    		const filePath = `${process.env.SHARED_DIR}/${fullPath.replace(' ', "\\ ")}${file.replace(' ', "\\ ")}`;
    		
    		if (file.includes('.'))
    			files.push({
    				dir: false,
    				name: file,
    				path: req.url,
    				fileSize: getFileSize(fsSync.statSync(`${process.env.SHARED_DIR}/${fullPath}${file}`).size)
    			});
    		else
    			files.push({
    				dir: true,
    				name: file,
    				path: req.url
    			});
    	});

    	res.render('file_sharing', {shared_files: true, pageTitle: 'File Sharing', username: req.user.username, sharedDirectories: files});
	} catch(error) {
		res.status(404).render('404', {shared_files: true, pageTitle: 'Page Not Found', username: req.user.username});
	}
};

export const HandleSharedFiles = async function(req, res) {
	// Detect if the request is to create a new directory
	// or upload a new file.
	if (req.body.mkdir) {
		try {
			const path = decodeURI(`${process.env.SHARED_DIR}/${req.originalUrl.split('/').splice(3).join('/')}`);
			const name = req.body.folder_name;
			await SharedFiles.createFolder(path, name);
			res.send();
		} catch (error) { // Detect if the request is to upload a new file.
			res.status(400).send(error.message);
		}
	} else {
		try {
			const path = decodeURI(`${process.env.SHARED_DIR}/${req.originalUrl.split('/').splice(3).join('/')}/${req.body.file_name}`);
			await SharedFiles.uploadFiles([{path: path, file: req.body.file}]);
			res.send();
		} catch (error) {
			res.status(400).send(error.message);
		}
	}
}

function getFileSize(size) {
	if (size <= 1000)
		size = `${size} Bytes`;
	else if (size >= 1000 && size <= 1000000)
		size = `${(size / 1000).toFixed(2)} KB`;
	else
		size = `${(size / 1000000).toFixed(2)} MB`;
	return size;
}