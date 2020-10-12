const userClass = Parse.Object.extend('_User');

export const AuthMiddleware = async function(req, res, next) {
    // Require authentication for all other directories except '/'.
    if (req.originalUrl === '/favicon.ico' || req.originalUrl === '/' || req.originalUrl.startsWith('/parse') || req.originalUrl.startsWith('/admin/dashboard')) {
        return next();
    }

    // We require an authorization header to be present.
    if (!req.headers.cookie) {
        return res.status(401).redirect('/');
    }

    // // Parse the header.
    var authParts = req.headers.cookie.split('token=')[1].split('%20');
    authParts[1] = authParts[1].replace('%3A', ':');

    if (authParts.length > 2 || authParts[0] !== 'Bearer') {
        return res.status(401).send('Authentication failed.');
    }

    var user;

    try {
        user = await new Parse.Query(userClass).first({sessionToken: authParts[1]});
    } catch (error) {
        if (error.code === 209) {
            if (req.method === 'GET') 
                return res.status(401).redirect('/');
            return res.status(401).send('Unauthorized.');
        }
        return res.status(400).send('There was an issue calling this endpoint.');
    }

    // Set our current user
    req.user = user.attributes;

    // We gucci!
    return next();
}