const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const grade = sequelize.define('grade', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  mark: {
        type:Sequelize.FLOAT,
      }
});
  module.exports = grade;