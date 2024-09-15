const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Students = sequelize.define('students', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  code:{
    type: Sequelize.BIGINT,
  },
  time:{
    type:Sequelize.STRING,
  },
  phoneNumber:{
    type:Sequelize.STRING,
    allowNull: false,
  },
  imagePath:{
    type:Sequelize.STRING,

  },
});

module.exports = Students;
