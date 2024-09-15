const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Chapter = sequelize.define('chapter', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
  },
    pdf_url:{
    type:Sequelize.STRING,
    },
});

module.exports = Chapter;
