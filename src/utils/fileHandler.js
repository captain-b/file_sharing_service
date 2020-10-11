const fs = require('fs');

export default class SharedFiles {
	static async uploadFiles(files) {

		if (!fs.existsSync(files[0].path )) {
			fs.writeFile(files[0].path, files[0].file.split(';base64,').pop(), 'base64', function(err) {
				if (!err)
					return;
				throw err.message;
			});
		} else {
			for (var i = 1; i != -1; i++) { // Find any dupllicates and rename the file.
				const name = files[0].path.split('.');
				if (!fs.existsSync(`${name[0]} (${i + 1}).${name[1]}`)) {
					fs.writeFile(`${name[0]} (${i + 1}).${name[1]}`, files[0].file.split(';base64,').pop(), 'base64', function(err) {
						if (!err) {
							i = 10;
							return;
						}
						throw err.message;
					});
					return;
				}
			}
		}
	}

	static async createFolder(path, name) {
		var fullPath = `${path}/${name}`;
		if (fullPath[fullPath.length - 1] !== '/')
			fullPath += '/';

		if (!fs.existsSync(fullPath)) {
		    fs.mkdirSync(fullPath);
		    return;
		} else {
			throw Error('A folder with this name already exists.');
		}
	}
}