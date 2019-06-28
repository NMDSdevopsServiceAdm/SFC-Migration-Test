/*
 * worker.js
 *
 * The encapsulation of a Worker, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 *
 * Also includes representation as JSON, in one or more presentations.
 */

const uuid = require('uuid');

// database models
const models = require('../index');

const EntityValidator = require('./validations/entityValidator').EntityValidator;
const ValidationMessage = require('./validations/validationMessage').ValidationMessage;

const WorkerExceptions = require('./worker/workerExceptions');

// associations
const Training = require('./training').Training;
const Qualification = require('./qualification').Qualification;


// Worker properties
const WorkerProperties = require('./worker/workerProperties').WorkerPropertyManager;
const JSON_DOCUMENT_TYPE = require('./worker/workerProperties').JSON_DOCUMENT;
const SEQUELIZE_DOCUMENT_TYPE = require('./worker/workerProperties').SEQUELIZE_DOCUMENT;

// WDF Calculator
const WdfCalculator = require('./wdfCalculator').WdfCalculator;

class Worker extends EntityValidator {
    constructor(establishmentId) {
        super();

        this._establishmentId = establishmentId;
        this._id = null;
        this._uid = null;
        this._contract = null;
        this._nameId = null;
        this._mainJob = null;
        this._created = null;
        this._updated = null;
        this._updatedBy = null;
        this._auditEvents = null;

        // abstracted properties
        const thisWorkerManager = new WorkerProperties();
        this._properties = thisWorkerManager.manager;

        // change properties
        this._isNew = false;

        // default logging level - errors only
        // TODO: INFO logging on Worker; change to LOG_ERROR only
        this._logLevel = Worker.LOG_INFO;

        // local attributes
        this._reason = null;
        this._lastWdfEligibility = null;

        // associated entities
        this._qualificationsEntities = [];
        this._trainingEntities = [];
    }

    // returns true if valid establishment id
    get _isEstablishmentIdValid() {
        if ((this._establishmentId &&
             Number.isInteger(this._establishmentId) &&
             this._establishmentId > 0)
            ) {
                return true;
            } else {
                return false;
            }
    }

    // private logging
    static get LOG_ERROR() { return 100; }
    static get LOG_WARN() { return 200; }
    static get LOG_INFO() { return 300; }
    static get LOG_TRACE() { return 400; }
    static get LOG_DEBUG() { return 500; }

    set logLevel(logLevel) {
        this._logLevel = logLevel;
    }

    _log(level, msg) {
        if (this._logLevel >= level) {
            console.log(`TODO: (${level}) - Worker class: `, msg);
        }
    }

    // used by save to initialise a new Worker; returns true if having initialised this worker
    _initialise() {
        if (this._uid === null) {
            this._isNew = true;
            this._uid = uuid.v4();

            if (!this._isEstablishmentIdValid)
                throw new WorkerExceptions.WorkerSaveException(null,
                                                               this._uid,
                                                               this._nameId,
                                                               `Unexpected Establishment Id (${this._establishmentId})`,
                                                               'Unknown Establishment');

            // note, do not initialise the id as this will be returned by database
            return true;
        } else {
            return false;
        }
    }

    // this method add this given qualification (entity) as an association to this worker entity - (bulk import)
    //  - note, no unique key for a qualification; just simply an array of
    associateQualification(qualification) {
        this._qualificationsEntities.push(qualification);
    };
    // this method add this given training (entity) as an association to this worker entity - (bulk import)
    //  - note, no unique key for a training; just simply an array of
    associateTraining(training) {
        this._trainingEntities.push(training);
    };

    get qualifications() {
        return this._qualificationsEntities;
    }
    get training() {
        return this._trainingEntities;
    }

    get establishmentId() {
        return this._establishmentId;
    }

    set establishmentId(establishmentId) {
        this._establishmentId = establishmentId;
    }

    get nameOrId() {
        // returns the name or id property - if known
        if (this._properties.get('NameOrId') && this._properties.get('NameOrId').property) {
            return this._properties.get('NameOrId').property;
        } else {
            return null;
        }
    }
    get contract() {
        return this._properties.get('Contract') ? this._properties.get('Contract').property : null;
    };

    get postcode() {
        return this._properties.get('Postcode') ? this._properties.get('Postcode').property : null;
    };
    get nationalInsuranceNumber() {
        return this._properties.get('NationalInsuranceNumber') ? this._properties.get('NationalInsuranceNumber').property : null;
    };
    get dasteOfBirth() {
        return this._properties.get('DateOfBirth') ? this._properties.get('DateOfBirth').property : null;
    };
    get gender() {
        return this._properties.get('Gender') ? this._properties.get('Gender').property : null;
    };
    get disabiliity() {
        return this._properties.get('Disability') ? this._properties.get('Disability').property : null;
    };
    get careCerticate() {
        return this._properties.get('CareCertificate') ? this._properties.get('CareCertificate').property : null;
    };
    get approvedMentalHealthWorker() {
        return this._properties.get('ApprovedMentalHealthWorker') ? this._properties.get('ApprovedMentalHealthWorker').property : null;
    }

    get socialCareQualification() {
        return this._properties.get('QualificationInSocialCare') ? this._properties.get('QualificationInSocialCare').property : null;
    }
    get socialCareQualificationLevel() {
        return this._properties.get('SocialCareQualification') ? this._properties.get('SocialCareQualification').property : null;
    }
    get nonSocialCareQualification() {
        return this._properties.get('OtherQualifications') ? this._properties.get('OtherQualifications').property : null;
    }
    get nonSocialCareQualificationLevel() {
        return this._properties.get('HighestQualification') ? this._properties.get('HighestQualification').property : null;
    }


    // takes the given JSON document and creates a Worker's set of extendable properties
    // Returns true if the resulting Worker is valid; otherwise false
    async load(document, associatedEntities=false) {
        try {
            this.resetValidations();

            await this._properties.restore(document, JSON_DOCUMENT_TYPE);

            // reason is not a managed property, load it specifically
            if (document.reason) {
                this._reason = await this.validateReason(document.reason);
            }

            // allow for deep restoration of entities (associations - namely Qualifications and Training here)
            if (associatedEntities) {
                const promises = [];

                // training records and qualifications are no change managed
                //  therefore, simply remove all existing associations
                //  and create new ones

                // first training records
                this._trainingEntities = [];
                if (document.training && Array.isArray(document.training)) {
                    document.training.forEach(thisTraining => {
                        const newTrainingRecord = new Training(null, null);

                        this.associateTraining(newTrainingRecord);
                        promises.push(newTrainingRecord.load(thisTraining));
                    });
                }

                // and qualifications records
                this._qualificationsEntities = [];
                if (document.qualifications && Array.isArray(document.qualifications)) {
                    document.qualifications.forEach(thisQualificationRecord => {
                        const newQualificationRecord = new Qualification(null, null);

                        this.associateQualification(newQualificationRecord);
                        promises.push(newQualificationRecord.load(thisQualificationRecord));
                    });
                }

                // wait for loading of all training and qualification records
                await Promise.all(promises);
            }

        } catch (err) {
            this._log(Worker.LOG_ERROR, `Woker::load - failed: ${err}`);
            throw new WorkerExceptions.WorkerJsonException(
                err,
                null,
                'Failed to load Worker from JSON');
        }
        return this.isValid();
    }

    // returns true if Worker is valid, otherwise false
    isValid() {
        // the property manager returns a list of all properties that are invalid; or true
        const thisWorkerIsValid = this._properties.isValid;

        // reason is an unmanaged property - validate explicitly
        const unmanagedPropertiesValid = (this._reason === null) || (this._reason !== null && this._reason.id > 0);

        if (thisWorkerIsValid === true && unmanagedPropertiesValid ) {
            return true;
        } else {
            // only add validations if not already existing
            if (thisWorkerIsValid && Array.isArray(thisWorkerIsValid) && this._validations.length == 0) {
                const propertySuffixLength = 'Property'.length * -1;
                thisWorkerIsValid.forEach(thisInvalidProp => {
                    this._validations.push(new ValidationMessage(
                        ValidationMessage.WARNING,
                        111111111,
                        'Invalid',
                        [thisInvalidProp.slice(0,propertySuffixLength)],
                    ));
                });
            }

            this._log(Worker.LOG_ERROR, `Worker invalid properties: ${thisWorkerIsValid.toString()}`);
            return false;
        }
    }

    async saveAssociatedEntities(savedBy, bulkUploaded=false, externalTransaction)  {
        const newQualificationsPromises = [];
        const newTrainingPromises = [];

        try {
            // there is no change audit on training; simply delete all that is there and recreate
            if (this._trainingEntities && this._trainingEntities.length > 0) {
                // delete all existing training records for this worker
                await models.workerTraining.destroy(
                    {
                        where: {
                            workerFk: this._id
                        },
                        transaction: externalTransaction,
                    });

                // now create new training records
                this._trainingEntities.forEach(currentTrainingRecord => {
                    currentTrainingRecord.workerId = this._id;
                    currentTrainingRecord.workerUid = this._uid;
                    currentTrainingRecord.establishmentId = this._establishmentId;
                    newTrainingPromises.push(currentTrainingRecord.save(savedBy, bulkUploaded, 0, externalTransaction));
                })
            }

            // there is no change audit on qualifications; simply delete all that is there and recreate
            if (this._qualificationsEntities && this._qualificationsEntities.length > 0) {
                // delete all existing training records for this worker
                await models.workerQualifications.destroy(
                    {
                        where: {
                            workerFk: this._id
                        },
                        transaction: externalTransaction,
                    });

                // now create new training records
                this._qualificationsEntities.forEach(currentQualificationRecord => {
                    currentQualificationRecord.workerId = this._id;
                    currentQualificationRecord.workerUid = this._uid;
                    currentQualificationRecord.establishmentId = this._establishmentId;
                    newQualificationsPromises.push(currentQualificationRecord.save(savedBy, bulkUploaded, 0, externalTransaction));
                })
            }

            await Promise.all(newTrainingPromises);
            await Promise.all(newQualificationsPromises);
        } catch (err) {
            console.error('Worker::saveAssociatedEntities error: ', err);
            // rethrow error to ensure the transaction is rolled back
            throw err;
        }

    }

    // saves the Worker to DB. Returns true if saved; false is not.
    // Throws "WorkerSaveException" on error
    async save(savedBy, bulkUploaded=false, ttl=0, externalTransaction=null, associatedEntities=false) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(Worker.LOG_ERROR, 'Not able to save an unknown uid');
            throw new WorkerExceptions.WorkerSaveException(null,
                this.uid,
                nameId ? nameId.property : null,
                'Not able to save an unknown uid',
                'Worker does not exist');
        }

        if (mustSave && this._isNew) {
            // create new Worker
            try {
                const creationDate = new Date();
                const creationDocument = {
                    establishmentFk: this._establishmentId,
                    uid: this.uid,
                    updatedBy: savedBy.toLowerCase(),
                    archived: false,
                    source: bulkUploaded ? 'Bulk' : 'Online',
                    updated: creationDate,
                    created: creationDate,
                    attributes: ['id', 'created', 'updated'],
                };

                // need to create the Worker record and the Worker Audit event
                //  in one transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an Worker can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // now append the extendable properties.
                    // Note - although the POST (create) has a default
                    //   set of mandatory properties, there is no reason
                    //   why we cannot create a Worker record with more properties
                    const modifedCreationDocument = this._properties.save(savedBy.toLowerCase(), creationDocument);

                    // now save the document
                    let creation = await models.worker.create(modifedCreationDocument, {transaction: thisTransaction});

                    const sanitisedResults = creation.get({plain: true});

                    this._id = sanitisedResults.ID;
                    this._created = sanitisedResults.created;
                    this._updated = sanitisedResults.updated;
                    this._updatedBy = savedBy.toLowerCase();
                    this._isNew = false;

                    // having the worker id we can now create the audit record; inserting the workerFk
                    const allAuditEvents = [{
                        workerFk: this._id,
                        username: savedBy.toLowerCase(),
                        type: 'created'}].concat(this._properties.auditEvents.map(thisEvent => {
                            return {
                                ...thisEvent,
                                workerFk: this._id
                            };
                        }));
                    await models.workerAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});


                    console.log("WA DEBUG - saving worker: ", this.nameOrId, associatedEntities)

                    if (associatedEntities) {
                        await this.saveAssociatedEntities(savedBy, bulkUploaded, thisTransaction);
                    }

                    this._log(Worker.LOG_INFO, `Created Worker with uid (${this._uid}) and id (${this._id})`);
                });

            } catch (err) {
                // if the name/Id property is known, use it in the error message
                const nameId = this._properties.get('NameOrId');

                if (err.name && err.name === 'SequelizeUniqueConstraintError') {
                    if(err.parent.constraint && ( err.parent.constraint === 'worker_LocalIdentifier_unq')){
                        throw new WorkerExceptions.WorkerSaveException(null, this._uid, nameId ? nameId.property : null, 'Duplicate LocalIdentifier', 'Duplicate LocalIdentifier');
                    }
                } else {
                    throw new WorkerExceptions.WorkerSaveException(null,
                                                                this.uid,
                                                                nameId ? nameId.property : null,
                                                                err,
                                                                null);
                }
            }
        } else {
            // we are updating an existing worker
            try {
                const updatedTimestamp = new Date();

                // need to update the existing Worker record and add an
                //  updated audit event within a single transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an Worker can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // now append the extendable properties
                    const modifedUpdateDocument = this._properties.save(savedBy.toLowerCase(), {});

                    // note - if the worker was created online, but then updated via bulk upload, the source become bulk and vice-versa.
                    const updateDocument = {
                        ...modifedUpdateDocument,
                        source: bulkUploaded ? 'Bulk' : 'Online',
                        updated: updatedTimestamp,
                        updatedBy: savedBy.toLowerCase()
                    };

                    // every time the worker is saved, need to calculate
                    //  it's current WDF Eligibility, and if it is eligible, update
                    //  the last WDF Eligibility status
                    const currentWdfEligibiity = await this.isWdfEligible(WdfCalculator.effectiveDate);

                    let wdfAudit = null;
                    if (currentWdfEligibiity.currentEligibility) {
                        updateDocument.lastWdfEligibility = updatedTimestamp;
                        wdfAudit = {
                            username: savedBy.toLowerCase(),
                            type: 'wdfEligible'
                        };
                    }

                    // now save the document
                    let [updatedRecordCount, updatedRows] =
                        await models.worker.update(updateDocument,
                                                {
                                                        returning: true,
                                                        where: {
                                                            uid: this.uid
                                                        },
                                                        attributes: ['id', 'updated'],
                                                        transaction: thisTransaction,
                                                });

                    if (updatedRecordCount === 1) {
                        const updatedRecord = updatedRows[0].get({plain: true});

                        this._updated = updatedRecord.updated;
                        this._updatedBy = savedBy.toLowerCase();
                        this._id = updatedRecord.ID;

                        // having updated the record, create the audit event
                        const allAuditEvents = [{
                            workerFk: this._id,
                            username: savedBy.toLowerCase(),
                            type: 'updated'}].concat(this._properties.auditEvents.map(thisEvent => {
                                return {
                                    ...thisEvent,
                                    workerFk: this._id
                                };
                            }));
                        if (wdfAudit) {
                            wdfAudit.workerFk = this._id;
                            allAuditEvents.push(wdfAudit);
                        }
                        await models.workerAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});

                        // now - work through any additional models having processed all properties (first delete and then re-create)
                        const additionalModels = this._properties.additionalModels;
                        const additionalModelsByname = Object.keys(additionalModels);
                        const deleteMmodelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            deleteMmodelPromises.push(
                                models[thisModelByName].destroy({
                                    where: {
                                      workerFk: this._id
                                    },
                                    transaction: thisTransaction,
                                  })
                            );
                        });
                        await Promise.all(deleteMmodelPromises);
                        const createMmodelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            const thisModelData = additionalModels[thisModelByName];
                            createMmodelPromises.push(
                                models[thisModelByName].bulkCreate(
                                    thisModelData.map(thisRecord => {
                                        return {
                                            ...thisRecord,
                                            workerFk: this._id
                                        };
                                    }),
                                    { transaction: thisTransaction },
                                )
                            );
                        });
                        await Promise.all(createMmodelPromises);

                        // TODO: ideally I'd like to publish this to pub/sub topic and process async - but do not have pub/sub to hand here
                        // having updated the Worker, check to see whether it is necessary to recalculate
                        //  the overall WDF eligibility for this Worker's establishment and all its workers.
                        //  This decision is done based on if this Worker is being marked as Completed.
                        const completedProperty = this._properties.get('Completed');
                        if (completedProperty && completedProperty.modified) {
                            await WdfCalculator.calculate(savedBy.toLowerCase(), this._establishmentId, null, thisTransaction);
                        }

                        if (associatedEntities) {
                            await this.saveAssociatedEntities(savedBy, bulkUploaded, thisTransaction);
                        }

                        this._log(Worker.LOG_INFO, `Updated Worker with uid (${this._uid}) and id (${this._id})`);

                    } else {
                        const nameId = this._properties.get('NameOrId');
                        throw new WorkerExceptions.WorkerSaveException(null,
                                                                    this.uid,
                                                                    nameId ? nameId.property : null,
                                                                    err,
                                                                    `Failed to update resulting worker record with uid: ${this._uid}`);
                    }

                });

            } catch (err) {
                // if the name/Id property is known, use it in the error message
                const nameId = this._properties.get('NameOrId');

                if (err.name && err.name === 'SequelizeUniqueConstraintError') {
                    if(err.parent.constraint && ( err.parent.constraint === 'worker_LocalIdentifier_unq')){
                        throw new WorkerExceptions.WorkerSaveException(null, this._uid, nameId ? nameId.property : null, 'Duplicate LocalIdentifier', 'Duplicate LocalIdentifier');
                    }
                } else {
                    throw new WorkerExceptions.WorkerSaveException(null,
                                                                this.uid,
                                                                nameId ? nameId.property : null,
                                                                err,
                                                                `Failed to update worker record with uid: ${this._uid}`);
                }
            }

        }

        if (mustSave && !this._isNew) {
            // update Worker - update timestamp!

        }

        // on successful completion of save, reset all change properties
        if (mustSave) {
            this._chgNameId = false;
            this._chgContract = false;
            this._chgJob = false;
        }

        return mustSave;
    };

    // loads the Worker (with given id) from DB, but only if it belongs to the given Establishment
    // returns true on success; false if no Worker
    // Can throw WorkerRestoreException exception.
    async restore(workerUid, showHistory=false, associatedEntities=false, associatedLevel) {
        if (!workerUid) {
            throw new WorkerExceptions.WorkerRestoreException(null,
                null,
                null,
                'Worker::restore failed: Missing uid',
                null,
                'Unexpected Error');
        }

        try {
            // by including the establishment id in the
            //  fetch, we are sure to only fetch those
            //  worker records associated to the given
            //   establishment
            const fetchQuery = {
                where: {
                    establishmentFk: this._establishmentId,
                    uid: workerUid,
                    archived: false
                },
                include: [
                    {
                        model: models.job,
                        as: 'mainJob',
                        attributes: ['id', 'title']
                    },
                    {
                        model: models.ethnicity,
                        as: 'ethnicity',
                        attributes: ['id', 'ethnicity']
                    },
                    {
                        model: models.nationality,
                        as: 'nationality',
                        attributes: ['id', 'nationality']
                    },
                    {
                        model: models.qualification,
                        as: 'socialCareQualification',
                        attributes: ['id', 'level']
                    },
                    {
                        model: models.qualification,
                        as: 'highestQualification',
                        attributes: ['id', 'level']
                    },
                    {
                        model: models.country,
                        as: 'countryOfBirth',
                        attributes: ['id', 'country']
                    },
                    {
                        model: models.recruitedFrom,
                        as: 'recruitedFrom',
                        attributes: ['id', 'from']
                    },
                    {
                        model: models.job,
                        as: 'otherJobs',
                        attributes: ['id', 'title']
                    },
                    {
                        model: models.workerNurseSpecialism,
                        as: 'nurseSpecialism',
                        attributes: ['id', 'specialism']
                    }
                ]
            };

            const fetchResults = await models.worker.findOne(fetchQuery);
            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._id = fetchResults.id;
                this._uid = workerUid;
                this._created = fetchResults.created;
                this._updated = fetchResults.updated;
                this._updatedBy = fetchResults.updatedBy;
                this._lastWdfEligibility = fetchResults.lastWdfEligibility;

                // if history of the Worker is also required; attach the association
                //  and order in reverse chronological - note, order on id (not when)
                //  because ID is primay key and hence indexed
                if (showHistory) {
                    fetchResults.auditEvents = await models.workerAudit.findAll({
                        where: {
                            workerFk: fetchResults.id
                        },
                        order: [
                            ['id','DESC']
                        ]
                    });
                }

                if (fetchResults.auditEvents) {
                    this._auditEvents = fetchResults.auditEvents;
                }

                // load extendable properties
                await this._properties.restore(fetchResults, SEQUELIZE_DOCUMENT_TYPE);

                // certainly for bulk upload, but also expected for cross-entity validations, restore all associated entities (qualifications and training)
                if (associatedEntities) {
                    const myQualificationsSet = await models.workerQualifications.findAll({
                        attributes: ['uid'],
                        where: {
                            workerFk: this._id,
                        },
                    });

                    if (myQualificationsSet && Array.isArray(myQualificationsSet)) {
                        await Promise.all(myQualificationsSet.map(async thisQualification => {
                            const newQualification = new Qualification(this._establishmentId, this._uid);
                            newQualification.workerId = this._id;

                            await newQualification.restore(thisQualification.uid, false);
                            this.associateQualification(newQualification);

                            return {};
                        }));
                    }

                    const myTrainingSet = await models.workerTraining.findAll({
                        attributes: ['uid'],
                        where: {
                            workerFk: this._id,
                        },
                    });

                    if (myTrainingSet && Array.isArray(myTrainingSet)) {
                        await Promise.all(myTrainingSet.map(async thisTrainingRecord => {
                            const newTrainingRecord = new Training(this._establishmentId, this._uid);
                            newTrainingRecord.workerId = this._id;

                            await newTrainingRecord.restore(thisTrainingRecord.uid, false);
                            this.associateTraining(newTrainingRecord);

                            return {};
                        }));
                    }
                }

                return true;
            }

            return false;

        } catch (err) {
            // typically errors when making changes to model or database schema!
            this._log(Worker.LOG_ERROR, err);

            throw new WorkerExceptions.WorkerRestoreException(null,
                this.uid,
                null,
                err,
                null);
        }
    };

    // "deletes" this Worker by setting the Worker to archived - does not delete any data!
    // Can throw "WorkerDeleteException"
    async archive(deletedBy, externalTransaction=null, associatedEntities=false) {
        try {

            const updatedTimestamp = new Date();

            // need to update the existing Worker record and add an
            //  deleted audit event within a single transaction
            await models.sequelize.transaction(async t => {
                const thisTransaction = externalTransaction ? externalTransaction : t;

                // now append the extendable properties
                const updateDocument = {
                    archived: true,
                    updated: updatedTimestamp,
                    updatedBy: deletedBy
                };

                if (this._reason) {
                    updateDocument.reasonFk = this._reason.id;

                    if (this._reason.other) {
                        updateDocument.otherReason = escape(this._reason.other);
                    }
                }

                // now save the document
                let [updatedRecordCount, updatedRows] =
                    await models.worker.update(updateDocument,
                                            {
                                                returning: true,
                                                where: {
                                                    uid: this.uid
                                                },
                                                attributes: ['id', 'updated'],
                                                transaction: thisTransaction,
                                            });

                if (updatedRecordCount === 1) {
                    const updatedRecord = updatedRows[0].get({plain: true});

                    this._updated = updatedRecord.updated;
                    this._updatedBy = deletedBy;
                    this._id = updatedRecord.ID;

                    const allAuditEvents = [{
                        workerFk: this._id,
                        username: deletedBy,
                        type: 'deleted'}];
                        // having updated the record, create the audit event
                    await models.workerAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});

                    // delete all training and qualifications for this user??
                    if (associatedEntities) {
                        // TODO - to be confirmed
                    }

                    this._log(Worker.LOG_INFO, `Archived Worker with uid (${this._uid}) and id (${this._id})`);

                } else {
                    const nameId = this._properties.get('NameOrId');
                    throw new WorkerExceptions.WorkerDeleteException(null,
                                                                this.uid,
                                                                nameId ? nameId.property : null,
                                                                err,
                                                                `Failed to update (archive) worker record with uid: ${this._uid}`);
                }
            });

        } catch (err) {
            // if the name/Id property is known, use it in the error message
            const nameId = this._properties.get('NameOrId');
            throw new WorkerExceptions.WorkerDeleteException(null,
                                                           this.uid,
                                                           nameId ? nameId.property : null,
                                                           err,
                                                           `Failed to delete (archive) worker record with uid: ${this._uid}`);
        }
    };

    // returns a set of Workers based on given filter criteria (all if no filters defined) - restricted to the given Establishment
    static async fetch(establishmentId, filters=null) {
        const allWorkers = [];
        try {

            let fetchResults = null;

            fetchResults =  await models.worker.findAll({
                where: {
                    establishmentFk: establishmentId,
                    archived: false
                },
                include: [
                    {
                        model: models.job,
                        as: 'mainJob',
                        attributes: ['id', 'title']
                        }
                ],
                attributes: ['uid', 'LocalIdentifier', 'NameOrIdValue', 'ContractValue', "CompletedValue", 'MainJobFkOther', 'lastWdfEligibility', "created", "updated", "updatedBy"],
                order: [
                    ['updated', 'DESC']
                ]
            });

            if (fetchResults) {
                const workerPromise = [];
                const effectiveFromTime = WdfCalculator.effectiveTime;
                const effectiveFromIso = WdfCalculator.effectiveDate.toISOString();

                fetchResults.forEach(thisWorker => {
                    allWorkers.push({
                        uid: thisWorker.uid,
                        localIdentifier: thisWorker.LocalIdentifier ? thisWorker.LocalIdentifier : undefined ,
                        nameOrId: thisWorker.NameOrIdValue,
                        contract: thisWorker.ContractValue,
                        mainJob: {
                            jobId: thisWorker.mainJob.id,
                            title: thisWorker.mainJob.title,
                            other: thisWorker.MainJobFkOther ? thisWorker.MainJobFkOther : undefined,
                        },
                        completed: thisWorker.CompletedValue,
                        created:  thisWorker.created.toJSON(),
                        updated: thisWorker.updated.toJSON(),
                        updatedBy: thisWorker.updatedBy,
                        effectiveFrom: effectiveFromIso,
                        wdfEligible: thisWorker.lastWdfEligibility && thisWorker.lastWdfEligibility.getTime() > effectiveFromTime ? true : false,
                        wdfEligibilityLastUpdated: thisWorker.lastWdfEligibility ? thisWorker.lastWdfEligibility.toISOString() : undefined
                    });
                });
                await Promise.all(workerPromise);
                return allWorkers;
            }
        } catch (err) {
            console.error("Worker::fetch - unexpected exception: ", err);
            throw err;
        }
    };

    // helper returns a set 'json ready' objects for representing a Worker's overall
    //  change history, from a given set of audit events (those events being created
    //  or updated only)
    formatWorkerHistoryEvents(auditEvents) {
        if (auditEvents) {
            return auditEvents.filter(thisEvent => ['created', 'updated', 'wdfEligible'].includes(thisEvent.type))
                               .map(thisEvent => {
                                    return {
                                        when: thisEvent.when,
                                        username: thisEvent.username,
                                        event: thisEvent.type
                                    };
                               });
        } else {
            return null;
        }
    };

    // helper returns a set 'json ready' objects for representing a Worker's audit
    //  history, from a the given set of audit events including those of individual
    //  worker properties)
    formatWorkerHistory(auditEvents) {
        if (auditEvents) {
            return auditEvents.map(thisEvent => {
                                    return {
                                        when: thisEvent.when,
                                        username: thisEvent.username,
                                        event: thisEvent.type,
                                        property: thisEvent.property,
                                        change: thisEvent.event
                                    };
                               });
        } else {
            return null;
        }
    };


    // returns a Javascript object which can be used to present as JSON
    //  showHistory appends the historical account of changes at Worker and individual property level
    //  showHistoryTimeline just returns the history set of audit events for the given Worker
    toJSON(showHistory=false, showPropertyHistoryOnly=true, showHistoryTimeline=false, modifiedOnlyProperties=false, associatedEntities=false) {
        if (!showHistoryTimeline) {
            // JSON representation of extendable properties
            const myJSON = this._properties.toJSON(showHistory, showPropertyHistoryOnly, modifiedOnlyProperties);

            // add worker default properties
            const myDefaultJSON = {
                uid:  this.uid
            };

            myDefaultJSON.created = this.created ? this.created.toJSON() : null;
            myDefaultJSON.updated = this.updated ? this.updated.toJSON() : null;
            myDefaultJSON.updatedBy = this.updatedBy ? this.updatedBy : null;

            // TODO: JSON schema validation
            if (showHistory && !showPropertyHistoryOnly) {
                return {
                    ...myDefaultJSON,
                    ...myJSON,
                    history: this.formatWorkerHistoryEvents(this._auditEvents)
                };
            } else {
                return {
                    ...myDefaultJSON,
                    ...myJSON,
                    training: associatedEntities ? this._trainingEntities.map(thisTrainingRecord => thisTrainingRecord ? thisTrainingRecord.toJSON() : undefined) : undefined,
                    qualifications: associatedEntities ? this._qualificationsEntities.map(thisQualification => thisQualification ? thisQualification.toJSON() : undefined) : undefined,
                };
            }
        } else {
            return {
                uid:  this.uid,
                created: this.created.toJSON(),
                updated: this.updated.toJSON(),
                updatedBy: this.updatedBy,
                history: this.formatWorkerHistory(this._auditEvents)
            };
        }
    }


    /*
     * attributes
     */
    get uid() {
        return this._uid;
    };
    get created() {
        return this._created;
    }
    get updated() {
        return this._updated;
    }
    get updatedBy() {
        return this._updatedBy;
    }


    // HELPERS
    // returns false if establishment is not valid, otherwise returns
    //  the establishment id
    static async validateEstablishment(establishmentId) {
        if (!establishmentId) return false;

        if (!Number.isInteger(establishmentId)) return false;

        if (establishmentId <= 0) return false;

        let referenceEstablishment;
        try {
            referenceEstablishment = await models.establishment.findOne({
                where: {
                    id: establishmentId
                },
                attributes: ['id'],
            });
            if (referenceEstablishment && referenceEstablishment.id && referenceEstablishment.id === establishmentId) return true;

        } catch (err) {
            console.error(err);
        }
        return false;
    }


    // returns true if all mandatory properties for a Worker exist and are valid
    get hasMandatoryProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise

        try {
            const nameIdProperty = this._properties.get('NameOrId');
            if (!(nameIdProperty && nameIdProperty.isInitialised && nameIdProperty.valid)) {
                allExistAndValid = false;
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    101,
                    nameIdProperty ? 'Invalid' : 'Missing',
                    ['WorkerNameOrId']
                ));
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid name or id property');
            }

            const mainJobProperty = this._properties.get('MainJob');
            if (!(mainJobProperty && mainJobProperty.isInitialised && mainJobProperty.valid)) {
                allExistAndValid = false;
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    102,
                    mainJobProperty ? 'Invalid' : 'Missing',
                    ['WorkerMainJob']
                ));
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid main job property');
            }

            const contractProperty = this._properties.get('Contract');
            if (!(contractProperty && contractProperty.isInitialised && contractProperty.valid)) {
                allExistAndValid = false;
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    103,
                    contractProperty ? 'Invalid' : 'Missing',
                    ['WorkerContract']
                ));
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid contract property');
            }

        } catch (err) {
            console.error(err)
        }


        return allExistAndValid;
    }

    // this helper validates reason, doing a lookup on id or reason text; returns false if
    //  invalidate, otherwise the validated reason (with id and reason)
    async validateReason(reasonDef) {
        if (!reasonDef) return false;
        if (!(reasonDef.id || reasonDef.reason)) return false;
        if (reasonDef.id && !(Number.isInteger(reasonDef.id))) return false;

        // reason "other" qualifier is optional, but if given, it must be less than 500 characters
        const MAX_LENGTH_ON_OTHER_REASON=500;
        if (reasonDef.other && reasonDef.other.length > MAX_LENGTH_ON_OTHER_REASON) return false;

        let referenceReason = null;
        if (reasonDef.id) {
            referenceReason = await models.workerLeaveReasons.findOne({
                where: {
                    id: reasonDef.id
                },
                attributes: ['id', 'reason'],
            });
        } else {
            referenceReason = await models.workerLeaveReasons.findOne({
                where: {
                    reason: reasonDef.reason
                },
                attributes: ['id', 'reason'],
            });
        }

        const leaveReasonIdOfOther = 8;
        if (referenceReason && referenceReason.id) {
            // found a ethnicity match
            return {
                id: referenceReason.id,
                reason: referenceReason.reason,
                other: reasonDef.id === leaveReasonIdOfOther && reasonDef.other ? reasonDef.other : null
            };
        } else {
            return false;
        }
    }

    // returns true if this worker is WDF eligible as referenced from the
    //  given effective date; otherwise returns false
    async isWdfEligible(effectiveFrom) {
        const wdfByProperty = await this.wdf(effectiveFrom);
        const wdfPropertyValues = Object.values(wdfByProperty);

        // NOTE - the worker does not have to be completed before it can be eligible for WDF

        return {
            lastEligibility: this._lastWdfEligibility ? this._lastWdfEligibility.toISOString() : null,
            isEligible: this._lastWdfEligibility && this._lastWdfEligibility.getTime() > effectiveFrom.getTime() ? true : false,
            currentEligibility: wdfPropertyValues.every(thisWdfProperty => thisWdfProperty !== 'No'),
            ... wdfByProperty
        };
    }

    _isPropertyWdfBasicEligible(refEpoch, property) {
        // no record given, so test eligibility of this Worker
        const PER_PROPERTY_ELIGIBLE=0;
        const RECORD_LEVEL_ELIGIBLE=1;
        const COMPLETED_PROPERTY_ELIGIBLE=2;
        const ELIGIBILITY_REFERENCE = COMPLETED_PROPERTY_ELIGIBLE;

        let referenceTime = null;

        switch (ELIGIBILITY_REFERENCE) {
            case PER_PROPERTY_ELIGIBLE:
              referenceTime = property.savedAt.getTime();
              break;
            case RECORD_LEVEL_ELIGIBLE:
              referenceTime = this._updated.getTime();
              break;
            case COMPLETED_PROPERTY_ELIGIBLE:
              const completedProperty = this._properties.get('Completed');
              referenceTime = completedProperty && completedProperty.savedAt
                                    ? completedProperty.savedAt.getTime()
                                    : null;
              break;
        }

        return  property &&
                (property.property !== null && property.property !== undefined) &&
                property.valid &&
                referenceTime !== null &&
                referenceTime > refEpoch;
    }

    // returns the WDF eligibility of each WDF relevant property as referenced from
    //  the given effect date
    // if "record" is given, then the WDF eligibility is calculated from the raw Worker record data
    async wdf(effectiveFrom) {
        const myWdf = {};
        const effectiveFromEpoch = effectiveFrom.getTime();

        // gender/date of birth/nationality
        myWdf['gender'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Gender')) ? 'Yes' : 'No';
        myWdf['dateOfBirth'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('DateOfBirth')) ? 'Yes' : 'No';
        myWdf['nationality'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Nationality')) ? 'Yes' : 'No';

        // main job, other job, main job start date, source of recruitment, employment status (contract)
        myWdf['mainJob'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('MainJob')) ? 'Yes' : 'No';
        myWdf['otherJobs'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('OtherJobs')) ? 'Yes' : 'No';
        myWdf['mainJobStartDate'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('MainJobStartDate')) ? 'Yes' : 'No';
        myWdf['recruitedFrom'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('RecruitedFrom')) ? 'Yes' : 'No';
        myWdf['contract'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Contract')) ? 'Yes' : 'No';

        // zero hours contract, contracted/average weekly hours (dependent on zero hours selected and on employment status/contract),

        const CONTRACT_TYPE = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
        myWdf['zeroHoursContract'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('ZeroHoursContract')) ? 'Yes' : 'No';
        if (this._properties.get('ZeroHoursContract').property === null) {
            // we have insufficient information to calculate whether the average/contracted weekly hours is WDF eligibnle
            myWdf['weeklyHoursContracted'] = 'Not relevant';
            myWdf['weeklyHoursAverage'] = 'Not relevant';
        } else {
            if (this._properties.get('ZeroHoursContract').property === 'No') {
                if (['Permanent', 'Temporary'].includes(this._properties.get('Contract').property)) {
                    myWdf['weeklyHoursContracted'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('WeeklyHoursContracted')) ? 'Yes' : 'No';
                } else {
                    myWdf['weeklyHoursContracted'] = 'Not relevant';
                }

                if (['Pool/Bank', 'Agency', 'Other'].includes(this._properties.get('Contract').property)) {
                    myWdf['weeklyHoursAverage'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('WeeklyHoursAverage')) ? 'Yes' : 'No';
                } else {
                    myWdf['weeklyHoursAverage'] = 'Not relevant';
                }
            } else if (this._properties.get('ZeroHoursContract').property === 'Yes') {
                // regardless of contract, all workers on zero hours contract, have an average set of weekly hours
                myWdf['weeklyHoursContracted'] = 'Not relevant';
                myWdf['weeklyHoursAverage'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('WeeklyHoursAverage')) ? 'Yes' : 'No';
            } else {
                // if zero hours contract is neither Yes or No, the average/contracted hour egligibility is not relevant
                myWdf['weeklyHoursContracted'] = 'Not relevant';
                myWdf['weeklyHoursAverage'] = 'Not relevant';
            }
        }

        // sickness and salary
        myWdf['annualHourlyPay'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('AnnualHourlyPay')) ? 'Yes' : 'No';
        // Note - contract is a mandatory property - it will always have value
        if (['Permanent', 'Temporary'].includes(this._properties.get('Contract').property)) {
            myWdf['daysSick'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('DaysSick')) ? 'Yes' : 'No';
        } else {
            myWdf['daysSick'] = 'Not relevant';
        }

        // qualifications and care certificate
        myWdf['careCertificate'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('CareCertificate')) ? 'Yes' : 'No';
        myWdf['qualificationInSocialCare'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('QualificationInSocialCare')) ? 'Yes' : 'No';7
        if (this._properties.get('QualificationInSocialCare').property === null || this._properties.get('QualificationInSocialCare').property === 'No') {
            // if not having defined 'having a qualification in social care' or 'have said no'
            myWdf['socialCareQualification'] = 'Not relevant';
        } else {
            myWdf['socialCareQualification'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('SocialCareQualification')) ? 'Yes' : 'No';
        }
        myWdf['otherQualification'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('OtherQualifications')) ? 'Yes' : 'No';
        if (this._properties.get('OtherQualifications').property === null || this._properties.get('OtherQualifications').property === 'No') {
            // if not having defined 'having another qualification' or 'have said no'
            myWdf['highestQualification'] = 'Not relevant';
        } else {
            myWdf['highestQualification'] = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('HighestQualification')) ? 'Yes' : 'No';
        }

        return myWdf;
    }

    // returns the WDF eligibilty as JSON object
    async wdfToJson() {
        const effectiveFrom = WdfCalculator.effectiveDate;
        return {
            effectiveFrom: effectiveFrom.toISOString(),
            ... await this.isWdfEligible(effectiveFrom)
        };
    }

};

module.exports.Worker = Worker;

// sub types
module.exports.WorkerExceptions = WorkerExceptions;