const ParseDashboard = require('parse-dashboard');

const RegisterParseDashboard = (app) => {
	const dashboard = new ParseDashboard({
        "apps": [
            {
                "serverURL": process.env.SERVER_URL + process.env.PARSE_MOUNT,
                "appId": process.env.FILE_SHARING_APP_ID,
                "javascriptKey": process.env.FILE_SHARING_JAVASCRIPT_KEY,
                "clientKey": process.env.FILE_SHARING_CLIENT_KEY,
                "masterKey": process.env.FILE_SHARING_MASTER_KEY,
                "appName": "File Sharing Service"
            }
        ],
        "users": [
            {
                "user": process.env.FILE_SHARING_DASHBOARD_USERNAME,
                "pass": process.env.FILE_SHARING_DASHBOARD_PASSWORD_HASHED
            }],
        "useEncryptedPasswords": false
    });
    app.use('/admin/dashboard', dashboard);
}

export default RegisterParseDashboard;