const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Video = sequelize.define('video', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
  },
  video_url:{
    type:Sequelize.STRING,
    },
});

module.exports = Video;
