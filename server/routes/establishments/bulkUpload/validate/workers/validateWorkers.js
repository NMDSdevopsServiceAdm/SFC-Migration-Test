const { validateWorkerCsv } = require('./validateWorkerCsv');
const { validateDuplicateWorkerID } = require('./validateDuplicateWorkerID');
const { validatePartTimeSalaryNotEqualToFTE } = require('./validatePartTimeSalaryNotEqualToFTE');
const { validateWorkerUnderNationalInsuranceMaximum } = require('./validateWorkerUnderNationalInsuranceMaximum');

const validateWorkers = async (workers, myCurrentEstablishments, allEstablishmentsByKey, myAPIEstablishments) => {
  const workersKeyed = [];
  const allWorkersByKey = {};

  const { csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myJSONWorkers } = await validateWorkerCsv(
    workers,
    myCurrentEstablishments,
  );

  console.info('Workers validated');

  // used to check for duplicates
  const allWorkerKeys = createKeysForWorkers(myWorkers);

  myJSONWorkers.forEach((thisWorker) => {
    validatePartTimeSalaryNotEqualToFTE(thisWorker, myJSONWorkers, myCurrentEstablishments, csvWorkerSchemaErrors);
    validateWorkerUnderNationalInsuranceMaximum(thisWorker, myJSONWorkers, csvWorkerSchemaErrors);
  });

  myWorkers.forEach((thisWorker) => {
    // uniqueness for a worker is across both the establishment and the worker
    const workerKey = createWorkerKey(thisWorker.local, thisWorker.uniqueWorker);
    const changeWorkerIdKey = thisWorker.changeUniqueWorker
      ? createWorkerKey(thisWorker.local, thisWorker.changeUniqueWorker)
      : null;

    if (
      validateDuplicateWorkerID(
        thisWorker,
        allWorkerKeys,
        changeWorkerIdKey,
        workerKey,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      )
    ) {
      // does not yet exist - check this worker can be associated with a known establishment
      const establishmentKey = thisWorker.local ? thisWorker.local.replace(/\s/g, '') : '';

      if (!allEstablishmentsByKey[establishmentKey]) {
        // not found the associated establishment
        csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());

        // remove the entity
        delete myAPIWorkers[thisWorker.lineNumber];
      } else {
        // this worker is unique and can be associated to establishment
        allWorkersByKey[workerKey] = thisWorker.lineNumber;

        // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
        if (changeWorkerIdKey) {
          allWorkersByKey[changeWorkerIdKey] = thisWorker.lineNumber;
        }

        // associate this worker to the known establishment
        const knownEstablishment = myAPIEstablishments[establishmentKey] ? myAPIEstablishments[establishmentKey] : null;

        // key workers, to be used in training
        workersKeyed[workerKey] = thisWorker._currentLine;

        if (knownEstablishment && myAPIWorkers[thisWorker.lineNumber]) {
          knownEstablishment.associateWorker(
            myAPIWorkers[thisWorker.lineNumber].key,
            myAPIWorkers[thisWorker.lineNumber],
          );
        } else {
          // this should never happen
          console.error(
            `FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorker})) with a known establishment.`,
          );
        }
      }
    }
  });

  workers.metadata.records = myWorkers.length;

  return { csvWorkerSchemaErrors, myAPIWorkers, workersKeyed, allWorkersByKey, myJSONWorkers };
};

const createKeysForWorkers = (workers) => {
  return workers.map((worker) => {
    return createWorkerKey(worker.local, worker.uniqueWorker);
  });
};

const createWorkerKey = (localEstablishmentId, workerId) => {
  return (localEstablishmentId + workerId).replace(/\s/g, '');
};

module.exports = {
  validateWorkers,
  createKeysForWorkers,
  createWorkerKey,
};
