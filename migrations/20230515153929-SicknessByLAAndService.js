'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTable = (queryInterface, tableName, column = null, transaction) => {
      return queryInterface.createTable(
        tableName,
        {
          LocalAuthorityArea: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          MainServiceFK: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: {
                tableName: 'services',
                schema: 'cqc',
              },
              key: 'reportingID',
            },
          },
          ...column,
          DayssickAdjustedFixedAmount: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
            allowNull: false,
          },
          DayssickAdjustedMultiplication: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
            allowNull: false,
          },
          BaseEstablishments: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          BaseWorkers: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          SicknessMean: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
        },
        {
          schema: 'cqc',
          transaction,
        },
      );
    };

    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        createTable(
          queryInterface,
          'SicknessByLAAndService',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'SicknessByLAAndServiceGoodOutstanding',

          {
            CQCGoodOutstandingRating: {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: false,
            },
          },

          t,
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.dropTable({
          tableName: 'SicknessByLAAndService',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'SicknessByLAAndServiceGoodOutstanding',
          schema: 'cqc',
        }),
      ]);
    });
  },
};
