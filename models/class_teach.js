const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const class_teach = sequelize.define('class_teach', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});
  module.exports = class_teach;