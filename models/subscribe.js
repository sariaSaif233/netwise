
const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const subscribe = sequelize.define('subscribe', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});
  module.exports = subscribe;