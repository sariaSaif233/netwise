const Sequelize = require('sequelize');
const sequelize = new Sequelize('product', 'root', 'saria', {
  dialect: 'mysql',
  host: 'localhost'
});


module.exports =sequelize;


