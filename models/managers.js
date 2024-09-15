const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Manager = sequelize.define('manager', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false

  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isSuperAdmin:{
    type:Sequelize.BOOLEAN,
    defaultValue: 0
  },
  code:{
    type: Sequelize.BIGINT,
  },
  time:{
    type:Sequelize.STRING,
  },
  imagePath:{
    type:Sequelize.STRING
  },
 
  phoneNumber:{
    type:Sequelize.STRING,
    }
});

module.exports = Manager;
