const expect = require('chai').expect;
const establishments = require('../../../mockdata/establishment').data;
const knownHeaders = require('../../../mockdata/establishment').knownHeaders;
const establishmentCsv = require('../../../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;

const testUtils = require('../../../../../utils/testUtils');
const sinon = require('sinon');
const csv = require('csvtojson');
const clonedeep = require('lodash.clonedeep');
const filename = 'server/models/BulkImport/csv/establishments.js';
const moment = require('moment');

const ALL_CAPACITIES = null;
const ALL_UTILISATIONS = null;
const BUDI_TO_ASC = 100;

const establishment = [
  {
    locationId: '1-123456780',
    id: 123,
  },
];
const postcode = [
  {
    postcode: 'AB13 4NJ',
  },
];

const models = {
  establishment: {
    async findAll(args) {
      if (args.where.locationId === establishment[0].locationId) {
        return establishment;
      } else {
        return [];
      }
    },
  },
  pcodedata: {
    async findAll(args) {
      if (args.where.postcode === postcode[0].postcode) {
        return [];
      } else {
        return postcode;
      }
    },
  },
};

const BUDI = {
  contractType(direction, originalCode) {
    const fixedMapping = [
      { ASC: 'Permanent', BUDI: 1 },
      { ASC: 'Temporary', BUDI: 2 },
      { ASC: 'Pool/Bank', BUDI: 3 },
      { ASC: 'Agency', BUDI: 4 },
      { ASC: 'Other', BUDI: 7 }, // multiple values mapping to Other; 7 needs to be first in list for the export
    ];

    if (direction === BUDI_TO_ASC) {
      const found = fixedMapping.find((thisType) => thisType.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisType) => thisType.ASC === originalCode);
    return found ? found.BUDI : null;
  },
  services(direction, originalCode) {
    const fixedMapping = [
      { ASC: 24, BUDI: 1 },
      { ASC: 25, BUDI: 2 },
      { ASC: 13, BUDI: 53 },
      { ASC: 12, BUDI: 5 },
      { ASC: 9, BUDI: 6 },
      { ASC: 10, BUDI: 7 },
      { ASC: 20, BUDI: 8 },
      { ASC: 35, BUDI: 73 },
      { ASC: 11, BUDI: 10 },
      { ASC: 21, BUDI: 54 },
      { ASC: 23, BUDI: 55 },
      { ASC: 18, BUDI: 12 },
      { ASC: 22, BUDI: 74 },
      { ASC: 1, BUDI: 13 },
      { ASC: 7, BUDI: 14 },
      { ASC: 2, BUDI: 15 },
      { ASC: 8, BUDI: 16 },
      { ASC: 19, BUDI: 17 },
      { ASC: 3, BUDI: 18 },
      { ASC: 5, BUDI: 19 },
      { ASC: 4, BUDI: 20 },
      { ASC: 6, BUDI: 21 },
      { ASC: 27, BUDI: 61 },
      { ASC: 28, BUDI: 62 },
      { ASC: 26, BUDI: 63 },
      { ASC: 29, BUDI: 64 },
      { ASC: 30, BUDI: 66 },
      { ASC: 32, BUDI: 67 },
      { ASC: 31, BUDI: 68 },
      { ASC: 33, BUDI: 69 },
      { ASC: 34, BUDI: 70 },
      { ASC: 17, BUDI: 71 },
      { ASC: 15, BUDI: 52 },
      { ASC: 16, BUDI: 72 },
      { ASC: 36, BUDI: 60 },
      { ASC: 14, BUDI: 75 },
    ];

    if (direction === BUDI_TO_ASC) {
      const found = fixedMapping.find((thisService) => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisService) => thisService.ASC === originalCode);
    return found ? found.BUDI : null;
  },
  serviceFromCapacityId(serviceCapacityId) {
    if (Array.isArray(ALL_CAPACITIES)) {
      const foundCapacity = ALL_CAPACITIES.find((thisCapacity) => thisCapacity.serviceCapacityId === serviceCapacityId);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  },
  serviceFromUtilisationId(serviceCapacityId) {
    if (Array.isArray(ALL_UTILISATIONS)) {
      const foundCapacity = ALL_UTILISATIONS.find(
        (thisCapacity) => thisCapacity.serviceCapacityId === serviceCapacityId,
      );

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  },
  establishmentType(direction, originalCode) {
    const fixedMapping = [
      { ASC: 'Local Authority (adult services)', BUDI: 1 },
      { ASC: 'Local Authority (generic/other)', BUDI: 3 },
      { ASC: 'Private Sector', BUDI: 6 },
      { ASC: 'Voluntary / Charity', BUDI: 7 },
      { ASC: 'Other', BUDI: 8 },
    ];

    if (direction === BUDI_TO_ASC) {
      const found = fixedMapping.find((thisTrainingCategory) => thisTrainingCategory.BUDI === originalCode);
      return found ? { type: found.ASC } : null;
    }

    const found = fixedMapping.find((thisType) => thisType.ASC === originalCode);
    return found ? found.BUDI : 8;
  },
  serviceUsers(direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 1 },
      { ASC: 2, BUDI: 2 },
      { ASC: 3, BUDI: 22 },
      { ASC: 4, BUDI: 23 },
      { ASC: 5, BUDI: 25 },
      { ASC: 6, BUDI: 26 },
      { ASC: 8, BUDI: 46 },
      { ASC: 7, BUDI: 27 },
      { ASC: 9, BUDI: 3 },
      { ASC: 10, BUDI: 28 },
      { ASC: 11, BUDI: 6 },
      { ASC: 12, BUDI: 29 },
      { ASC: 13, BUDI: 5 },
      { ASC: 14, BUDI: 4 },
      { ASC: 15, BUDI: 7 },
      { ASC: 16, BUDI: 8 },
      { ASC: 17, BUDI: 31 },
      { ASC: 18, BUDI: 9 },
      { ASC: 19, BUDI: 45 },
      { ASC: 20, BUDI: 18 },
      { ASC: 21, BUDI: 19 },
      { ASC: 22, BUDI: 20 },
      { ASC: 23, BUDI: 21 },
    ];

    if (direction === BUDI_TO_ASC) {
      const found = fixedMapping.find((thisService) => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    } else {
      const found = fixedMapping.find((thisService) => thisService.ASC === originalCode);
      return found ? found.BUDI : null;
    }
  },
  jobRoles(direction, originalCode) {
    const fixedMapping = [
      { ASC: 26, BUDI: 1 },
      { ASC: 15, BUDI: 2 },
      { ASC: 13, BUDI: 3 },
      { ASC: 22, BUDI: 4 },
      { ASC: 28, BUDI: 5 },
      { ASC: 27, BUDI: 6 },
      { ASC: 25, BUDI: 7 },
      { ASC: 10, BUDI: 8 },
      { ASC: 11, BUDI: 9 },
      { ASC: 12, BUDI: 10 },
      { ASC: 3, BUDI: 11 },
      { ASC: 18, BUDI: 15 },
      { ASC: 23, BUDI: 16 },
      { ASC: 4, BUDI: 17 },
      { ASC: 29, BUDI: 22 },
      { ASC: 20, BUDI: 23 },
      { ASC: 14, BUDI: 24 },
      { ASC: 2, BUDI: 25 },
      { ASC: 5, BUDI: 26 },
      { ASC: 21, BUDI: 27 },
      { ASC: 1, BUDI: 34 },
      { ASC: 24, BUDI: 35 },
      { ASC: 19, BUDI: 36 },
      { ASC: 17, BUDI: 37 },
      { ASC: 16, BUDI: 38 },
      { ASC: 7, BUDI: 39 },
      { ASC: 8, BUDI: 40 },
      { ASC: 9, BUDI: 41 },
      { ASC: 6, BUDI: 42 },
    ];

    if (direction === BUDI_TO_ASC) {
      const found = fixedMapping.find((thisJob) => thisJob.BUDI === originalCode);
      return found ? found.ASC : null;
    } else {
      const found = fixedMapping.find((thisJob) => thisJob.ASC === originalCode);
      return found ? found.BUDI : null;
    }
  },
};

const mapCsvToEstablishment = (establishment, headers) =>
  headers.reduce((mapped, header, index) => {
    mapped[header] = establishment[index];

    return mapped;
  }, {});
const getUnitInstance = () => {
  const bulkUpload = testUtils.sandBox(filename, {
    locals: {
      require: testUtils.wrapRequire({
        '../BUDI': {
          BUDI,
        },
        '../../index': {
          models,
        },
        moment: moment,
        'lodash.clonedeep': {
          clonedeep,
        },
      }),
    },
  });

  expect(bulkUpload).to.have.property('WorkplaceCsvValidator');

  expect(bulkUpload.WorkplaceCsvValidator).to.be.a('function');

  expect(BUDI.contractType).to.be.a('function');

  expect(models.establishment.findAll).to.be.a('function');

  return new bulkUpload.WorkplaceCsvValidator();
};

describe.skip('/server/models/Bulkimport/csv/establishment-old.js', () => {
  beforeEach(() => {
    sinon.stub(establishmentCsv.prototype, '_validateNoChange').callsFake((args) => {
      return true;
    });
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('get headers', () => {
    it('should return the correct list of headers', () => {
      const bulkUpload = getUnitInstance();

      expect(bulkUpload).to.have.property('headers');

      const columnHeaders = bulkUpload.headers;

      expect(columnHeaders).to.be.a('string');

      expect(columnHeaders.split(',')).to.deep.equal(knownHeaders);
    });
  });

  establishments.forEach((establishment, index) => {
    describe('toCSV(entity) with establishment ' + index, () => {
      it('should match the header values', async () => {
        let otherservices = '';
        let localauthorities = '';
        let capacities = '';
        let serviceDesc = '';
        let serviceUsers = '';
        let otherServiceUsers = '';
        const jobs = [];
        let alljobs = '';
        let allStarters = '';
        let allLeavers = '';
        let allVacancies = '';
        let reasons = '';
        let reasonCount = '';

        const bulkImportEstablishment = getUnitInstance();

        expect(bulkImportEstablishment).to.have.property('toCSV');
        expect(bulkImportEstablishment.toCSV).to.be.a('function');

        const establishmentCSV = bulkImportEstablishment.toCSV(establishment);

        expect(establishmentCSV).to.be.a('string');

        const foundValues = (
          await csv({
            noheader: true,
            output: 'csv',
          }).fromString(establishmentCSV)
        )[0];

        expect(foundValues.length).to.equal(knownHeaders.length);

        if (Array.isArray(establishment.otherServices)) {
          establishment.otherServices.forEach((service, index) => {
            otherservices += service.budi;
            index < establishment.otherServices.length - 1 ? (otherservices += ';') : (otherservices += '');
          });
        } else {
          expect(establishment.otherServices).to.equal(null);
        }

        if (Array.isArray(establishment.shareWithLA)) {
          establishment.shareWithLA.forEach((la, index) => {
            localauthorities += la.cssrId;
            index < establishment.shareWithLA.length - 1 ? (localauthorities += ';') : (localauthorities += '');
          });
        } else {
          expect(establishment.shareWithLA).to.equal(null);
        }

        if (Array.isArray(establishment.capacities)) {
          establishment.capacities.forEach((capacity, index) => {
            if (capacity.reference.other) {
              serviceDesc += capacity.reference.other;
            }
            if (index < establishment.capacities.length - 1) {
              capacities += ';';
              serviceDesc += ';';
            } else {
              capacities += '';
              serviceDesc += '';
            }
          });
        } else {
          expect(establishment.capacities).to.equal(null);
        }

        if (Array.isArray(establishment.serviceUsers)) {
          establishment.serviceUsers.forEach((sUser, index) => {
            if (sUser.other) {
              otherServiceUsers += sUser.other;
            }
            serviceUsers += sUser.budi;
            if (index < establishment.serviceUsers.length - 1) {
              serviceUsers += ';';
              otherServiceUsers += ';';
            } else {
              serviceUsers += '';
              otherServiceUsers += '';
            }
          });
        } else {
          expect(establishment.serviceUsers).to.equal(null);
        }

        if (Array.isArray(establishment.starters)) {
          establishment.starters.forEach((job) => {
            if (!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        } else {
          expect(establishment.starters).to.equal(null);
        }

        if (Array.isArray(establishment.leavers)) {
          establishment.leavers.forEach((job) => {
            if (!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        } else {
          expect(establishment.leavers).to.equal(null);
        }

        if (Array.isArray(establishment.vacancies)) {
          establishment.vacancies.forEach((job) => {
            if (!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        } else {
          expect(establishment.vacancies).to.equal(null);
        }

        jobs.forEach((job, index) => {
          alljobs += job;

          allStarters += establishment.starters.findIndex((starters) => job === starters.budi) !== -1 ? '' : '0';
          allLeavers += establishment.leavers.findIndex((leavers) => job === leavers.budi) !== -1 ? '' : '0';
          allVacancies += establishment.vacancies.findIndex((vacancies) => job === vacancies.budi) !== -1 ? '' : '0';

          if (index < jobs.length - 1) {
            alljobs += ';';
            allStarters += ';';
            allLeavers += ';';
            allVacancies += ';';
          } else {
            alljobs += '';
            allStarters += '';
            allLeavers += '';
            allVacancies += '';
          }
        });

        if (establishment.reasonsForLeaving) {
          const reasonsForLeaving = establishment.reasonsForLeaving.split('|');

          reasonsForLeaving.forEach((reason, index) => {
            const reasonarray = reason.split(':');
            reasons += reasonarray[0];
            reasonCount += reasonarray[1];

            if (index < reasonsForLeaving.length - 1) {
              reasons += ';';
              reasonCount += ';';
            } else {
              reasons += '';
              reasonCount += '';
            }
          });
        }

        const mappedCsv = mapCsvToEstablishment(foundValues, knownHeaders);

        expect(mappedCsv.LOCALESTID).to.equal(establishment.localIdentifier);
        expect(mappedCsv.STATUS).to.equal('UNCHECKED');
        expect(mappedCsv.ESTNAME).to.equal(establishment.name);
        expect(mappedCsv.ADDRESS1).to.equal(establishment.address1);
        expect(mappedCsv.ADDRESS2).to.equal(establishment.address2);
        expect(mappedCsv.ADDRESS3).to.equal(establishment.address3);
        expect(mappedCsv.POSTTOWN).to.equal(establishment.town);
        expect(mappedCsv.POSTCODE).to.equal(establishment.postcode);

        if (establishment.employerType.id) {
          expect(parseInt(mappedCsv.ESTTYPE)).to.equal(establishment.employerType.id);
          expect(mappedCsv.OTHERTYPE).to.equal('');
        } else {
          expect(mappedCsv.OTHERTYPE).to.equal('');
        }

        expect(mappedCsv.PERMCQC).to.equal(
          establishment.shareWith.enabled && establishment.shareWith.with.indexOf('CQC') > -1 ? '1' : '',
        );
        expect(mappedCsv.PERMLA).to.equal(
          establishment.shareWith.enabled && establishment.shareWith.with.indexOf('Local Authority') > -1 ? '1' : '',
        );
        expect(mappedCsv.SHARELA).to.equal(localauthorities);
        expect(mappedCsv.REGTYPE).to.equal(establishment.isRegulated ? '2' : '0');
        expect(mappedCsv.PROVNUM).to.equal(establishment.provId);
        expect(mappedCsv.LOCATIONID).to.equal(establishment.locationId);
        expect(parseInt(mappedCsv.MAINSERVICE)).to.equal(establishment.mainService.budi);
        expect(mappedCsv.ALLSERVICES).to.equal(otherservices);
        expect(mappedCsv.CAPACITY).to.equal(capacities);
        expect(mappedCsv.UTILISATION).to.equal(capacities);
        expect(mappedCsv.SERVICEDESC).to.equal(serviceDesc);
        expect(mappedCsv.SERVICEUSERS).to.equal(serviceUsers);
        expect(mappedCsv.OTHERUSERDESC).to.equal(otherServiceUsers);
        expect(parseInt(mappedCsv.TOTALPERMTEMP)).to.equal(establishment.numberOfStaff);
        expect(mappedCsv.ALLJOBROLES).to.equal(alljobs);
        expect(mappedCsv.STARTERS).to.equal(allStarters);
        expect(mappedCsv.LEAVERS).to.equal(allLeavers);
        expect(mappedCsv.VACANCIES).to.equal(allVacancies);
        expect(mappedCsv.REASONS).to.equal(reasons);
        expect(mappedCsv.REASONNOS).to.equal(reasonCount);
      });
    });
  });

  describe('validations', () => {
    it('should emit an error if REGTYPE is 2 (CQC) but no CQC regulated services have been specified', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': { clonedeep },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '',
          LOCATIONID: '',
          MAINSERVICE: '12',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: 'A-328849599',
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          origin: 'WorkplaceCsvValidator',
          lineNumber: 2,
          errCode: 1100,
          errType: 'REGTYPE_ERROR',
          error:
            'REGTYPE is 2 (CQC) but no CQC regulated services have been specified. Please change either REGTYPE or MAINSERVICE',
          source: '2',
          name: 'omar3',
        },
      ]);
    });

    it('should not emit an error if REGTYPE is 2 (CQC) but a CQC regulated main service has been specified', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456789',
          LOCATIONID: '1-123456789',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });
    it('should not emit an error if REGTYPE is 2 (CQC) but a CQC regulated main service has been specified', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456789',
          LOCATIONID: '1-123456789',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8',
          STARTERS: '0;0',
          LEAVERS: '999',
          VACANCIES: '999;333',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });
    it('should emit an error if REGTYPE is not 2 (CQC) but a registered manager vacancy has been specified', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '0',
          PROVNUM: '',
          LOCATIONID: '',
          MAINSERVICE: '12',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          origin: 'WorkplaceCsvValidator',
          lineNumber: 2,
          warnCode: 2180,
          warnType: 'ALL_JOBS_WARNING',
          warning: 'Vacancy for Registered Manager should not be included for this service and will be ignored',
          source: '34;8;4',
          name: 'omar3',
        },
      ]);
    });
    it('should emit an error if MainService has not been given', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456789',
          LOCATIONID: '1-123456789',
          MAINSERVICE: '',
          ALLSERVICES: '',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: null,
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned
      expect(validationErrors[0]).to.deep.equal({
        errCode: 1000,
        errType: 'MAIN_SERVICE_ERROR',
        error: 'MAINSERVICE has not been supplied',
        lineNumber: 2,
        name: 'omar3',
        origin: 'WorkplaceCsvValidator',
        source: '',
      });
    });
    it('should not emit an error if REGTYPE is 2 (CQC) but a registered manager vacancy has been specified', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-12345678',
          LOCATIONID: '1-12345678',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });
    it('should emit an error if locationId has already been used in the database and not this establishment', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456780',
          LOCATIONID: '1-123456780',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          errCode: 1020,
          errType: 'STATUS_ERROR',
          error: 'Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it',
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: 'UPDATE',
        },
        {
          errCode: 1110,
          errType: 'LOCATION_ID_ERROR',
          error: 'LOCATIONID already exists in ASC-WDS please contact Support on 0113 241 0969',
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: '1-123456780',
        },
      ]);
    });
    it('should not emit an error if locationId has already been used in the database and is this establishment', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: '123',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456780',
          LOCATIONID: '1-123456780',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 123,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
            key: '123',
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });

    it('should not emit an error if locationId has not already been used in the database', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'LN11 9JG',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });

    it('should emit an error if postcode cannot be found in the reference data', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4NJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: 'AB13 4NJ',
          errCode: 1040,
          errType: 'ADDRESS_ERROR',
          error: 'The Postcode for this workplace cannot be found in our database and must be registered manually.',
        },
      ]);
    });

    it('should not emit an error if postcode can be found in the reference data', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'NEW',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4MJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([]);
    });

    it('should emit an warning if postcode cannot be found in the reference data', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4NJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'AB13 4NJ',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          errCode: 1020,
          errType: 'STATUS_ERROR',
          error: 'Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it',
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: 'UPDATE',
        },
        {
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: 'AB13 4NJ',
          warnCode: 1040,
          warnType: 'ADDRESS_ERROR',
          warning: 'The POSTCODE cannot be found in our database and will be ignored.',
        },
      ]);
    });

    it('should not emit an error if postcode can be found in the reference data', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': {
              clonedeep,
            },
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4MJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8;4',
          STARTERS: '0;0;0',
          LEAVERS: '999;0;0',
          VACANCIES: '999;333;1',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: null,
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('validate');

      // call the validation to ensure the proper error is shown
      await bulkUpload.validate();

      const validationErrors = bulkUpload.validationErrors;

      // assert a warning was returned

      expect(validationErrors).to.deep.equal([
        {
          errCode: 1020,
          errType: 'STATUS_ERROR',
          error: 'Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it',
          lineNumber: 2,
          name: 'omar3',
          origin: 'WorkplaceCsvValidator',
          source: 'UPDATE',
        },
      ]);
    });
  });

  describe('cross entity validations', () => {
    it('should an error if cqc registered and have no registered manager vacancy or registered manager staff member', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4NJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8',
          STARTERS: '0;0',
          LEAVERS: '999;0',
          VACANCIES: '999;0',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('crossValidate');

      const csvEstablishmentSchemaErrors = [];

      const myWorkers = [
        {
          status: 'UPDATE',
          establishmentKey: 'omar3',
          mainJobRoleId: 3,
          otherJobIds: [6],
        },
      ];

      // the real version of this code is in the api WorkplaceCsvValidator business object and runs a sql query.
      // We just return a 'fake result set'
      const fetchMyEstablishmentsWorkers = sinon.spy(async (establishmentId, establishmentKey) => {
        return [];
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvEstablishmentSchemaErrors,
        myWorkers,
        fetchMyEstablishmentsWorkers,
      });

      // assert the fetchMyEstalishmentsWorkers function was called
      expect(fetchMyEstablishmentsWorkers.callCount).to.equal(1);

      // assert a warning was returned
      expect(csvEstablishmentSchemaErrors.length).to.equal(1);

      expect(csvEstablishmentSchemaErrors[0]).to.deep.equal({
        lineNumber: 2,
        name: 'omar3',
        origin: 'WorkplaceCsvValidator',
        source: '34;8',
        errCode: 1280,
        errType: 'ALL_JOBS_ERROR',
        error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
      });
    });
    it('should not an error if cqc registered and have registered manager vacancy or registered manager staff member (as main)', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4NJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8',
          STARTERS: '0;0',
          LEAVERS: '999;0',
          VACANCIES: '999;0',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('crossValidate');

      const csvEstablishmentSchemaErrors = [];

      const myWorkers = [
        {
          status: 'UPDATE',
          establishmentKey: 'omar3',
          mainJobRoleId: 4,
          otherJobIds: [],
        },
      ];

      // the real version of this code is in the api WorkplaceCsvValidator business object and runs a sql query.
      // We just return a 'fake result set'
      const fetchMyEstablishmentsWorkers = sinon.spy(async (establishmentId, establishmentKey) => {
        return [];
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvEstablishmentSchemaErrors,
        myWorkers,
        fetchMyEstablishmentsWorkers,
      });

      // assert the fetchMyEstalishmentsWorkers function was called
      expect(fetchMyEstablishmentsWorkers.callCount).to.equal(1);
      // assert a warning was returned
      expect(csvEstablishmentSchemaErrors.length).to.equal(0);

      expect(csvEstablishmentSchemaErrors[0]).to.deep.equal();
    });
    it('should not an error if cqc registered and have registered manager vacancy or registered manager staff member (as other)', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            '../../index': {
              establishment: models.establishment,
              pcodedata: models.pcodedata,
            },
            moment: moment,
            'lodash.clonedeep': clonedeep,
          }),
        },
      }).WorkplaceCsvValidator)(
        {
          LOCALESTID: 'omar3',
          STATUS: 'UPDATE',
          ESTNAME: 'WOZiTech, with even more care',
          ADDRESS1: 'First Line',
          ADDRESS2: 'Second Line',
          ADDRESS3: '',
          POSTTOWN: 'My Town',
          POSTCODE: 'AB13 4NJ',
          ESTTYPE: '6',
          OTHERTYPE: '',
          PERMCQC: '1',
          PERMLA: '1',
          SHARELA: '708;721;720',
          REGTYPE: '2',
          PROVNUM: '1-123456781',
          LOCATIONID: '1-123456781',
          MAINSERVICE: '8',
          ALLSERVICES: '12;13',
          CAPACITY: '0;0',
          UTILISATION: '0;0',
          SERVICEDESC: '1;1',
          SERVICEUSERS: '',
          OTHERUSERDESC: '',
          TOTALPERMTEMP: '1',
          ALLJOBROLES: '34;8',
          STARTERS: '0;0',
          LEAVERS: '999;0',
          VACANCIES: '999;0',
          REASONS: '',
          REASONNOS: '',
        },
        2,
        [
          {
            _validations: [],
            _username: 'aylingw',
            _id: 479,
            _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _ustatus: null,
            _created: '2019-03-15T09:54:10.562Z',
            _updated: '2019-10-04T15:46:16.158Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech, with even more care',
            _address1: 'First Line',
            _address2: 'Second Line',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: 'A-328849599',
            _provId: null,
            _postcode: 'LN11 9JG',
            _isRegulated: false,
            _mainService: { id: 16, name: 'Head office services' },
            _nmdsId: 'G1001114',
            _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
            _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
            _establishmentWdfEligibility: null,
            _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
            _isParent: true,
            _parentUid: null,
            _parentId: null,
            _parentName: null,
            _dataOwner: 'Workplace',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'NEW',
            _logLevel: 300,
          },
          {
            _validations: [],
            _username: 'aylingw',
            _id: 1446,
            _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
            _ustatus: null,
            _created: '2019-07-31T15:09:57.405Z',
            _updated: '2019-10-04T15:46:16.797Z',
            _updatedBy: 'aylingw',
            _auditEvents: null,
            _name: 'WOZiTech Cares Sub 100',
            _address1: 'Number 1',
            _address2: 'My street',
            _address3: '',
            _town: 'My Town',
            _county: '',
            _locationId: '1-888777666',
            _provId: '1-999888777',
            _postcode: 'LN11 9JG',
            _isRegulated: true,
            _mainService: { id: 1, name: 'Carers support' },
            _nmdsId: 'G1002110',
            _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
            _overallWdfEligibility: null,
            _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
            _staffWdfEligibility: null,
            _isParent: false,
            _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
            _parentId: 479,
            _parentName: null,
            _dataOwner: 'Parent',
            _dataPermissions: 'None',
            _archived: false,
            _dataOwnershipRequested: null,
            _reasonsForLeaving: '',
            _properties: {
              _properties: [Object],
              _propertyTypes: [Array],
              _auditEvents: null,
              _modifiedProperties: [],
              _additionalModels: null,
            },
            _isNew: false,
            _workerEntities: {},
            _readyForDeletionWorkers: null,
            _status: 'COMPLETE',
            _logLevel: 300,
          },
        ],
      );

      expect(bulkUpload).to.have.property('crossValidate');

      const csvEstablishmentSchemaErrors = [];

      const myWorkers = [
        {
          status: 'UPDATE',
          establishmentKey: 'omar3',
          mainJobRoleId: 3,
          otherJobIds: [4],
        },
      ];

      // the real version of this code is in the api WorkplaceCsvValidator business object and runs a sql query.
      // We just return a 'fake result set'
      const fetchMyEstablishmentsWorkers = sinon.spy(async (establishmentId, establishmentKey) => {
        return [];
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvEstablishmentSchemaErrors,
        myWorkers,
        fetchMyEstablishmentsWorkers,
      });

      // assert the fetchMyEstalishmentsWorkers function was called
      expect(fetchMyEstablishmentsWorkers.callCount).to.equal(1);

      // assert a warning was returned
      expect(csvEstablishmentSchemaErrors.length).to.equal(0);

      expect(csvEstablishmentSchemaErrors[0]).to.deep.equal();
    });
  });
});
