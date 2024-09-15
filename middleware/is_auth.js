const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token ) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
   
     jwt.verify(token , 'L93KjbNwTdR4yvSgEcP6XfM2D7zR8hWq', (err, userID) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userID = userID;
        next();
    });
};