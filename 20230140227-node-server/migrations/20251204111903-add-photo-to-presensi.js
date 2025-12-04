'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Presensis', 'buktiFoto', {
    type: Sequelize.STRING, 
    allowNull: true
    });
  },
}
