'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      Presensi.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    }
  }
  Presensi.init({
    userId: DataTypes.INTEGER,
    checkIn: DataTypes.DATE,
    checkOut: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Presensi',
  });
  return Presensi;
};