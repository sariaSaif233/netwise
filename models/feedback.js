const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Feedback = sequelize.define('feedback', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
    teacherOpinion: 
    { 
    type: Sequelize.STRING, 
    allowNull: false 
    },
    courseOpinion: 
    { 
    type: Sequelize.STRING, 
    allowNull: false 
    },
    rate: 
    { 
    type: Sequelize.INTEGER, 
     
    },
    notes: 
    { 
    type: Sequelize.STRING, 
     
    },
});

module.exports = Feedback;
