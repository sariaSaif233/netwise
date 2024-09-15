const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Answer = sequelize.define('answer', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  answer_text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  is_correct: {
    type:Sequelize.BOOLEAN,
    allowNull:false
  }
});

module.exports = Answer;
