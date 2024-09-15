const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const exam_question = sequelize.define('exam_question', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
});
  module.exports = exam_question;