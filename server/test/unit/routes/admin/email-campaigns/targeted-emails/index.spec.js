const fs = require('fs');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const targetedEmailsRoutes = require('../../../../../../routes/admin/email-campaigns/targeted-emails');
const sendInBlue = require('../../../../../../utils/email/sendInBlueEmail');
const models = require('../../../../../../models');
const { build, fake, sequence } = require('@jackfranklin/test-data-bot/build');
const sendEmail = require('../../../../../../services/email-campaigns/targeted-emails/sendEmail');

const user = build('User', {
  fields: {
    FullNameValue: fake((f) => f.name.findName()),
    email: fake((f) => f.internet.email()),
    get: () => fake((f) => f.internet.email()),
    establishment: {
      id: sequence(),
      NameValue: fake((f) => f.lorem.sentence()),
      nmdsId: fake((f) => f.helpers.replaceSymbols('?#####')),
    },
  },
});

describe('server/routes/admin/email-campaigns/targeted-emails', () => {
  describe('getTargetedTotalEmails()', () => {
    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/total',
        role: 'Admin',
      });

      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a 200 and the total number of primary users', async () => {
      sinon.stub(models.user, 'allPrimaryUsers').returns([user, user, user]);

      req.query.groupType = 'primaryUsers';

      await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.totalEmails).to.deep.equal(3);
    });

    it('should return a 200 and the total number of parent users', async () => {
      sinon.stub(models.user, 'allPrimaryUsers').withArgs({ isParent: true }).returns([user, user]);

      req.query.groupType = 'parentOnly';

      await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.totalEmails).to.deep.equal(2);
    });

    it('should return a 200 and the total number of single workplace only users', async () => {
      sinon
        .stub(models.user, 'allPrimaryUsers')
        .withArgs({ isParent: false, dataOwner: 'Workplace' })
        .returns([user, user, user, user]);

      req.query.groupType = 'singleAccountsOnly';

      await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.totalEmails).to.deep.equal(4);
    });
  });

  describe('getTargetedEmailTemplates()', () => {
    let req;
    let res;

    beforeEach(() => {
      sinon.stub(sendInBlue, 'getTemplates').returns({
        count: 1,
        templates: [
          {
            id: 3,
            name: 'Email about something important',
            subject: 'Merry Christmas',
            isActive: false,
            testSent: false,
            sender: { name: 'John', email: 'john.smith@example.com', id: 23 },
            replyTo: 'replyto@domain.com',
            toField: '',
            tag: 'Festival',
            htmlContent: 'HTML CONTENT 1',
            createdAt: '2016-02-24T14:44:24.000Z',
            modifiedAt: '2016-02-24T15:37:11.000Z',
          },
        ],
      });

      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/templates',
        role: 'Admin',
      });

      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 200', async () => {
      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the templates from send in blue', async () => {
      const templates = {
        templates: [
          {
            id: 3,
            name: 'Email about something important',
          },
        ],
      };

      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(response).to.deep.equal(templates);
    });

    it('should return an empty array if error thrown', async () => {
      sinon.restore();
      sinon.stub(sendInBlue, 'getTemplates').throws();

      const templates = {
        templates: [],
      };

      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(templates);
    });
  });

  describe('createTargetedEmailsCampaign()', () => {
    let mockUsers = [];
    for (let i = 0; i < Math.ceil(Math.random() * 10); i++) {
      mockUsers.push(user());
    }

    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/targeted-emails',
        role: 'Admin',
      });

      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a 500 on error', async () => {
      sinon.stub(models.user, 'allPrimaryUsers').throws();

      req.body.groupType = 'primaryUsers';
      req.body.templateId = '1';

      await targetedEmailsRoutes.createTargetedEmailsCampaign(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should create a targeted emails campaign', async () => {
      const allPrimaryUsers = sinon.stub(models.user, 'allPrimaryUsers').returns(mockUsers);
      const userMock = sinon.stub(models.user, 'findByUUID').returns({
        id: 1,
      });
      const createEmailCampaignMock = sinon.stub(models.EmailCampaign, 'create').returns({
        id: 1,
        userID: 1,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
      });
      const createEmailCampaignHistoryMock = sinon.stub(models.EmailCampaignHistory, 'bulkCreate');
      const sendEmailMock = sinon.stub(sendEmail, 'sendEmail').returns();

      req.body.groupType = 'primaryUsers';
      req.body.templateId = '1';
      req.userUid = '1402bf74-bf25-46d3-a080-a633f748b441';

      await targetedEmailsRoutes.createTargetedEmailsCampaign(req, res);

      const response = res._getData();

      sinon.assert.called(allPrimaryUsers);
      sinon.assert.calledWith(userMock, '1402bf74-bf25-46d3-a080-a633f748b441');
      sinon.assert.calledWith(createEmailCampaignMock, {
        userID: 1,
        type: 'targetedEmails',
      });
      sinon.assert.calledOnce(createEmailCampaignHistoryMock);
      sinon.assert.calledWith(sendEmailMock, mockUsers[0]);
      expect(response).to.deep.equal({ success: true });
      expect(res.statusCode).to.deep.equal(200);
    });
  });

  describe('uploadAndValidateMultipleAccounts', () => {
    let dbStub;
    let fsReadFileSyncStub;
    let req;
    let res;

    beforeEach(() => {
      dbStub = sinon.stub(models.user, 'allPrimaryUsers');
      fsReadFileSyncStub = sinon.stub(fs, 'readFileSync');
      sinon.stub(fs, 'unlinkSync').returns(null);

      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/targeted-emails/total',
        role: 'Admin',
        file: { path: 'some-random-path' },
      });

      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns 200 if validation of recipients is OK', async () => {
      fsReadFileSyncStub.returns('');
      dbStub.returns([]);

      await targetedEmailsRoutes.uploadAndValidateMultipleAccounts(req, res, sinon.fake());

      expect(res.statusCode).to.equal(200);
    });

    it('returns a count of the valid establishments', async () => {
      fsReadFileSyncStub.returns('id1');
      dbStub.returns(['user']);

      await targetedEmailsRoutes.uploadAndValidateMultipleAccounts(req, res, sinon.fake());

      expect(res._getData()).to.deep.equal({ totalEmails: 1 });
    });

    it('should return a 500 on error', async () => {
      fsReadFileSyncStub.returns('id1');
      dbStub.throws();

      await targetedEmailsRoutes.uploadAndValidateMultipleAccounts(req, res, sinon.fake());

      expect(res.statusCode).to.equal(500);
    });
  });
});
