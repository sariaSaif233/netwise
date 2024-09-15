const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Subjects = sequelize.define('subjects', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,

  },
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true,
},
  
});

module.exports = Subjects;
