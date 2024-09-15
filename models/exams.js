const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Exam = sequelize.define('exam', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  level: 
  { 
    type: Sequelize.STRING, 
    allowNull: false 
},
 name: 
  { 
    type: Sequelize.STRING, 
    allowNull: false 
}

});

module.exports = Exam;
