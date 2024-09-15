'use strict';

const Wallet = require('../models/wallet');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    const wallet=await Wallet.create();

    const wallet_id=wallet.id;
    // Insert the manager with the hashed password
    await queryInterface.bulkInsert('managers', [
      {
        name: 'admin',
        password: hashedPassword,
        email: 'admin@gmail.com',
        isSuperAdmin: 1,
        walletId:wallet_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('managers', null, {});
  }
};
