const Users = require('../models/students');
module.exports = (req, res, next) => {
    let name = req.body.name;
    Users.findOne({ where: { name: name } }).then(user => {
        if (user) {
            return res.status(401).json({ message: 'User has registered !' });
        }
        next();
    });
}