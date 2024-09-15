const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const note = sequelize.define('note', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    defaultValue: "New Note"
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

module.exports = note;