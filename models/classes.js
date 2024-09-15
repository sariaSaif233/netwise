const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Classes = sequelize.define('classes', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    unique:true,
    allowNull: false
  },
  section: {
    type: Sequelize.STRING
  },
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true,
},
});

module.exports = Classes;
