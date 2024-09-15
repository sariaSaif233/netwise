const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const sub_teach = sequelize.define('sub_teach', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  precntage:{
    type:Sequelize.FLOAT
  },
  salary:{
    type:Sequelize.FLOAT
  }
});
  module.exports = sub_teach;