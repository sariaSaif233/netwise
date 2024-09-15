const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const read = sequelize.define('read', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});
  module.exports = read;