const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
const fs = require('fs').promises;

const dbPath = process.env.DB_PATH; // The directory of which we would like StupidB to be at

export default class StupiDB {
	static async saveUser(object) {
		
		// Encrypt the password before we roll
		object.password = await bcrypt.hash(object.password, 10);

		try {
			// Load the users from the DB
			var users;

			const userFile = await fs.readFile(`${dbPath}/Users.stpd`, 'utf8');

			// If the user file doesn't exist, assign an empty array
			if (userFile === '' || !userFile || typeof userFile === 'undefined') 
				users = [];
			else // Parse the users
				users = JSON.parse(userFile);

			// Check if anything exists in the DB
			if (users && users.count !== 0) {
				// Check if user is a duplicate
				users.forEach(function(user) {
					if (user.username === object.username)
						throw Error('User already exists.');
				});

				// Add the new user to our array
				users.push(object);

				// Write the new users array to our class
				await fs.writeFile(`${dbPath}/Users.stpd`, JSON.stringify(users));
			} else { // If we don't have any users, write the raw object to our class
				await fs.writeFile(`${dbPath}/Users.stpd`, JSON.stringify([object]));
			}

			// Locked and loaded!!
			return {status: 200, message: 'Saved'};
		} catch (error) {
			if (error.errno === -2) {
				// Create a new class if it doesn't already exist
				fs.writeFile(`${dbPath}/Users.stpd`, JSON.stringify([object])).then(function(){
					return {status: 200, message: 'Saved'};
				}, function(error) {
					// Sadly, fs failed at this point
					throw error;
				});
			} else {
				// Sadly, fs failed at this point
				throw error;
			}
		}
	}

	static async login(user) {
		try {

			// Retrieve the Users class
			const userObjects = JSON.parse(await fs.readFile(`${dbPath}/Users.stpd`, 'utf8'));

			// Go through each user object to see if the username exists.
			for (var i = 0; i < userObjects.length; i++) {
				if (userObjects[i].username == user.username) {
					// Compare the provided hashed password with the saved hashed password.
					const compare = await bcrypt.compare(user.password, userObjects[i].password);

					if (!compare) // If passwords don't match, throw an error
						throw Error('Invalid username or password.');

					// Take the username and mix it with our secret sauce (We're using this as our token)
					return CryptoJS.AES.encrypt(user.username, process.env.TOKEN_ENCRYPTION_SECRET || 'secret').toString();
				}

				if (userObjects.length === i + 1) {
					throw Error('Invalid username or password.');
				}
			}

		} catch (error) {
			throw error.message;
		}
	}

	static async save(objectClass, object) {
		
		// Encrypt the password before we roll
		object.password = await bcrypt.hash(object.password, 10);

		try {
			// Load the objects from the DB
			var objects;

			const file = await fs.readFile(`${dbPath}/${objectClass}.stpd`, 'utf8');

			// If the file doesn't exist, assign an empty array
			if (file === '' || !file || typeof file === 'undefined') 
				objects = [];
			else // Parse the objects
				objects = JSON.parse(file);

			// Check if anything exists in the DB
			if (objects && objects.count !== 0) {
				// Add the new object to our array
				objects.push(object);

				// Write the new objects array to our class
				await fs.writeFile(`${dbPath}/${objectClass}.stpd`, JSON.stringify(objects));
			} else { // If we don't have any objects, write the raw object to our class
				await fs.writeFile(`${dbPath}/${objectClass}.stpd`, JSON.stringify([object]));
			}

			// Locked and loaded!!
			return {status: 200, message: 'Saved'};
		} catch (error) {
			if (error.errno === -2) {
				// Create a new class if it doesn't already exist
				fs.writeFile(`${dbPath}/${objectClass}.stpd`, JSON.stringify([object])).then(function(){
					return {status: 200, message: 'Saved'};
				}, function(error) {
					// Sadly, fs failed at this point
					throw error;
				});
			} else {
				// Sadly, fs failed at this point
				throw error;
			}
		}
	}
}