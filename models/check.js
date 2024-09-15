const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const check = sequelize.define('check', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  price: {
    type:Sequelize.FLOAT
  },
  imagePath:{
    type:Sequelize.STRING
  },
  approved:{
    type:Sequelize.BOOLEAN,
    defaultValue: 0
  },

});
  module.exports = check;