const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Question = sequelize.define('question', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  question_text: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  difficulty: {
    type: Sequelize.STRING,
    allowNull: false,
  },

});

module.exports = Question;
