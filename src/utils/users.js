import StupiDB from './db';

export default class User {
	static async save(username, password) {
		try {
			return await StupiDB.saveUser({username: username, password: password});
		} catch(error) {
			throw error.message;
		}
	}

	static async login(username, password) {
		try {
			const user = await StupiDB.login({username: username, password: password});
			return user;
		} catch(error) {
			throw error;
		}
	}
}