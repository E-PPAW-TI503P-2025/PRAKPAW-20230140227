'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambah kolom latitude
    await queryInterface.addColumn('Presensis', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    });
    
    // Menambah kolom longitude
    await queryInterface.addColumn('Presensis', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus kolom kalau di-undo
    await queryInterface.removeColumn('Presensis', 'latitude');
    await queryInterface.removeColumn('Presensis', 'longitude');
  }
};