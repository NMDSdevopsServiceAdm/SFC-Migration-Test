const expect = require('chai').expect;
const sinon = require('sinon');

const dbmodels = require('../../../../../server/models');
sinon.stub(dbmodels.status, 'ready').value(false);
const TrainingCsvValidator = require('../../../classes/trainingCSVValidator').TrainingCsvValidator;
const mappings = require('../../../../../reference/BUDIMappings').mappings;

describe('trainingCSVValidator', () => {
  describe('validations', () => {
    it('should pass validation if no ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator(
        {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'bar',
          CATEGORY: 1,
          DESCRIPTION: 'training',
          DATECOMPLETED: '',
          EXPIRYDATE: '',
          ACCREDITED: '',
          NOTES: '',
        },
        2,
        mappings,
      );

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
    });

    it('should pass validation if ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator(
        {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'bar',
          CATEGORY: 1,
          DESCRIPTION: 'training',
          DATECOMPLETED: '',
          EXPIRYDATE: '',
          ACCREDITED: '1',
          NOTES: '',
        },
        2,
        mappings,
      );

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
      expect(validator.accredited).to.equal('Yes');
    });

    it('should fail validation if invalid ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator(
        {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'bar',
          CATEGORY: 1,
          DESCRIPTION: 'training',
          DATECOMPLETED: '',
          EXPIRYDATE: '',
          ACCREDITED: '3',
          NOTES: '',
        },
        1,
        mappings,
      );

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([
        {
          errCode: 1060,
          errType: 'ACCREDITED_ERROR',
          error: 'ACCREDITED is invalid',
          lineNumber: 1,
          name: 'foo',
          source: '3',
          column: 'ACCREDITED',
          worker: 'bar',
        },
      ]);
      expect(validator._validationErrors.length).to.equal(1);
    });
  });
});
