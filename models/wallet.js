const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const wallet = sequelize.define('wallet', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  price: {
        type:Sequelize.FLOAT,
        defaultValue: 0
      }
});
  module.exports = wallet;