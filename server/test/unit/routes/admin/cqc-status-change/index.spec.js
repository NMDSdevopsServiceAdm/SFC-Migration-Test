const faker = require('faker');
const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models/index');
const cqcStatusChange = require('../../../../../routes/admin/cqc-status-change');

var workplaceObjectWasSaved = false;
var testWorkplace = {
  id: 4321,
  isRegulated: false,
  MainServiceFKValue: 1,
  nmdsId: 'I1234567',
  NameValue: faker.lorem.words(4),
  save: () => {
    return (workplaceObjectWasSaved = true);
  },
};

var testUser = {
  id: 1234,
};

var approvalObjectWasSaved = false;
var fakeApproval = {
  ID: 9,
  UUID: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
  EstablishmentID: testWorkplace.id,
  UserID: testUser.id,
  createdAt: '2020-05-18 09:25:12.896+01',
  Status: 'Pending',
  Establishment: {
    uid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
    nmdsId: testWorkplace.nmdsId,
    NameValue: testWorkplace.NameValue,
  },
  User: {
    FullNameValue: faker.name.findName(),
  },
  Data: {
    requestedService: {
      id: 1,
      name: 'Carers support',
    },
    currentService: {
      id: 14,
      name: 'Any childrens / young peoples services',
      other: 'Other Name',
    },
  },
  save: () => {
    approvalObjectWasSaved = true;
  },
};

var approvalRequestBody = {
  approvalId: fakeApproval.ID,
  establishmentId: testWorkplace.id,
  userId: testUser.id,
  rejectionReason: 'Because I felt like it.',
};

var returnedJson = null;
var returnedStatus = null;
const approvalJson = (json) => {
  returnedJson = json;
};
const approvalStatus = (status) => {
  returnedStatus = status;
  return {
    json: approvalJson,
    send: () => {},
  };
};
var throwErrorWhenFetchingAllRequests = false;
var throwErrorWhenFetchingSingleRequest = false;

describe.skip('admin/cqc-status-change route', () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(async () => {
    sinon.stub(models.Approvals, 'findAllPending').callsFake(async () => {
      if (throwErrorWhenFetchingAllRequests) {
        throw 'Oopsy! findAllPending throwing error.';
      } else {
        return [fakeApproval];
      }
    });

    sinon.stub(models.Approvals, 'findbyId').callsFake(async (id) => {
      if (throwErrorWhenFetchingSingleRequest) {
        throw 'Oopsy! findbyId throwing error.';
      } else if (id === fakeApproval.ID) {
        return fakeApproval;
      }
    });

    sinon.stub(models.establishment, 'findbyId').callsFake(async (id) => {
      if (id === testWorkplace.id) {
        return testWorkplace;
      }
    });

    returnedJson = null;
    returnedStatus = null;
    throwErrorWhenFetchingAllRequests = false;
    throwErrorWhenFetchingSingleRequest = false;
  });

  describe('fetching CQC Status Approval', () => {
    it('should return an array of cqc status approvals', async () => {
      // Arrange (see beforeEach)

      // Act
      await cqcStatusChange.getCqcStatusChanges({}, { status: approvalStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal([
        {
          requestId: fakeApproval.ID,
          requestUUID: fakeApproval.UUID,
          establishmentId: fakeApproval.EstablishmentID,
          establishmentUid: fakeApproval.Establishment.uid,
          userId: fakeApproval.UserID,
          workplaceId: fakeApproval.Establishment.nmdsId,
          username: fakeApproval.User.FullNameValue,
          orgName: fakeApproval.Establishment.NameValue,
          requested: fakeApproval.createdAt,
          status: 'Pending',
          data: {
            currentService: {
              ID: fakeApproval.Data.currentService.id,
              name: fakeApproval.Data.currentService.name,
              other: fakeApproval.Data.currentService.other,
            },
            requestedService: {
              ID: fakeApproval.Data.requestedService.id,
              name: fakeApproval.Data.requestedService.name,
              other: null,
            },
          },
        },
      ]);
    });

    it('should return 400 on error', async () => {
      // Arrange
      throwErrorWhenFetchingAllRequests = true;

      // Act
      await cqcStatusChange.getCqcStatusChanges({}, { status: approvalStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('approving a new cqcStatusRequest', () => {
    beforeEach(async () => {
      approvalRequestBody.approve = true;
    });

    it('should change the approval status to Approved when approving a CQC Status Change', async () => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(fakeApproval.Status).to.equal('Approved');
    });

    it('should save the approval object when approving a CQC Status Change', async () => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should return 400 on error', async () => {
      // Arrange
      throwErrorWhenFetchingSingleRequest = true;
      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('rejecting a new CQC Status Change', () => {
    beforeEach(async () => {
      approvalRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the status change is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(cqcStatusChange.cqcStatusChangeRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should change the approval status to Rejected when rejecting a cqc status change', async () => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(fakeApproval.Status).to.equal('Rejected');
    });

    it('should save the approval object when rejecting a cqc status change', async () => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should NOT save the workplace object when rejecting a status change', async () => {
      // Arrange
      workplaceObjectWasSaved = false;

      // Act
      await cqcStatusChange.cqcStatusChanges(
        {
          body: approvalRequestBody,
        },
        { status: approvalStatus },
      );

      // Assert
      expect(workplaceObjectWasSaved).to.equal(false);
    });
  });
});
