const CryptoJS = require("crypto-js");


export const AuthMiddleware = async function(req, res, next) {
    // console.log(req.originalUrl);
    // console.log(req.body);
    // console.log(req.headers);
	// Require authentication for all other directories except '/'.
    if (req.originalUrl === '/') {
        return next();
    }

	// We require an authorization header to be present.
    if (!req.headers.cookie) {
        return res.status(401).redirect('/');
    }


    // // Parse the header.
    var authParts = req.headers.cookie.split('token=')[1].split('%20');

    if (authParts.length > 2 || authParts[0] !== 'Bearer') {
        return res.status(401).send('Authentication failed.');
    }

    authParts[1] = authParts[1].replace('%2F', '/');
    authParts[1] = authParts[1].replace('%3D', '=');
    authParts[1] = authParts[1].replace('%2B', '+');

    // authParts[1] = decodeURI(authParts[1]);

    const bytes  = CryptoJS.AES.decrypt(authParts[1], process.env.TOKEN_ENCRYPTION_SECRET || 'secret');
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    // Make sure the correct credentials are provided.
    if (authParts.length > 2 || authParts[0] !== 'Bearer' || authParts[1] !== process.env.BACKEND_AUTH_TOKEN && !decryptedData) {
        return res.status(401).redirect('/');
    }

    req.user = {username: decryptedData};
    // req.user = {username: 'elham'};

    // We gucci!
    return next();
}