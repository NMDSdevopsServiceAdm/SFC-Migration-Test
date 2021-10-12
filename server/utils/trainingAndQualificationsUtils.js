const moment = require('moment');

const convertWorkerTrainingBreakdown = (worker) => {
  const expiredTrainingCount = parseInt(worker.get('expiredTrainingCount'));
  const expiredMandatoryTrainingCount = parseInt(worker.get('expiredMandatoryTrainingCount'));
  const expiringTrainingCount = parseInt(worker.get('expiringTrainingCount'));
  const expiringMandatoryTrainingCount = parseInt(worker.get('expiringMandatoryTrainingCount'));

  const workerIdAsNumber = parseInt(worker.get('NameOrIdValue'));

  return {
    name: workerIdAsNumber ? workerIdAsNumber : worker.get('NameOrIdValue'),
    trainingCount: parseInt(worker.get('trainingCount')),
    qualificationCount: parseInt(worker.get('qualificationCount')),
    expiredTrainingCount,
    expiredMandatoryTrainingCount,
    expiredNonMandatoryTrainingCount: expiredTrainingCount - expiredMandatoryTrainingCount,
    expiringTrainingCount,
    expiringMandatoryTrainingCount,
    expiringNonMandatoryTrainingCount: expiringTrainingCount - expiringMandatoryTrainingCount,
    missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
    mandatoryTrainingCount: parseInt(worker.get('mandatoryTrainingCount')),
  };
};

exports.convertWorkerTrainingBreakdowns = (rawWorkerTrainingBreakdowns) => {
  return rawWorkerTrainingBreakdowns.map((trainingBreakdown) => {
    return convertWorkerTrainingBreakdown(trainingBreakdown);
  });
};

const convertWorkerWithTrainingRecords = (worker) => {
  const workerIdAsNumber = parseInt(worker.get('NameOrIdValue'));
  const mandatoryTraining = worker.get('mandatoryTraining');

  return {
    workerId: workerIdAsNumber ? workerIdAsNumber : worker.get('NameOrIdValue'),
    jobRole: worker.mainJob.title,
    jobId: worker.mainJob.id,
    longTermAbsence: worker.get('LongTermAbsence') ? worker.get('LongTermAbsence') : '',
    mandatoryTraining: Array.isArray(mandatoryTraining) ? mandatoryTraining : [mandatoryTraining],
    trainingRecords: convertWorkerTraining(worker.workerTraining),
  };
};

const convertWorkerTraining = (workerTraining) => {
  return workerTraining.map((trainingRecord) => {
    const expiryDate = moment(trainingRecord.get('Expires'));

    return {
      category: trainingRecord.get('category').category,
      categoryFK: trainingRecord.get('CategoryFK'),
      trainingName: trainingRecord.get('Title'),
      expiryDate: expiryDate.isValid() ? expiryDate.format('DD/MM/YYYY') : '',
      status: getTrainingRecordStatus(expiryDate),
      dateCompleted: trainingRecord.get('Completed')
        ? moment(trainingRecord.get('Completed')).format('DD/MM/YYYY')
        : '',
      accredited: trainingRecord.get('Accredited') ? trainingRecord.get('Accredited') : '',
    };
  });
};

const getTrainingRecordStatus = (expiryDate) => {
  if (!expiryDate.isValid()) {
    return 'Up-to-date';
  }

  const currentDate = moment();
  const expiringSoonDate = moment().add(90, 'days');

  if (expiryDate < currentDate) {
    return 'Expired';
  }
  if (expiryDate < expiringSoonDate) {
    return 'Expiring soon';
  }
  return 'Up-to-date';
};

exports.convertWorkersWithTrainingRecords = (rawWorkersWithTrainingRecords) => {
  return rawWorkersWithTrainingRecords.map((worker) => {
    return convertWorkerWithTrainingRecords(worker);
  });
};

exports.getTrainingTotals = (workers) => {
  let expiredTotalRecords = 0;
  let expiredTotalMandatory = 0;
  let expiringTotalRecords = 0;
  let expiringTotalMandatory = 0;
  let totalRecords = 0;
  let totalMandatoryRecords = 0;
  let missingRecords = 0;

  for (let worker of workers) {
    expiredTotalRecords += worker.expiredTrainingCount;
    expiredTotalMandatory += worker.expiredMandatoryTrainingCount;
    expiringTotalRecords += worker.expiringTrainingCount;
    expiringTotalMandatory += worker.expiringMandatoryTrainingCount;
    totalRecords += worker.trainingCount;
    totalMandatoryRecords += worker.mandatoryTrainingCount;
    missingRecords += worker.missingMandatoryTrainingCount;
  }

  const upToDateTotalRecords = totalRecords - expiringTotalRecords - expiredTotalRecords;
  const upToDateTotalMandatory = totalMandatoryRecords - expiringTotalMandatory - expiredTotalMandatory;
  const upToDateTotalNonMandatory = upToDateTotalRecords - upToDateTotalMandatory;

  return {
    total: {
      mandatory: totalMandatoryRecords,
      nonMandatory: totalRecords - totalMandatoryRecords,
      totalRecords,
    },
    upToDate: {
      total: upToDateTotalRecords,
      mandatory: upToDateTotalMandatory,
      nonMandatory: upToDateTotalNonMandatory,
    },
    expiringSoon: {
      mandatory: expiringTotalMandatory,
      nonMandatory: expiringTotalRecords - expiringTotalMandatory,
      total: expiringTotalRecords,
    },
    expired: {
      mandatory: expiredTotalMandatory,
      nonMandatory: expiredTotalRecords - expiredTotalMandatory,
      total: expiredTotalRecords,
    },
    missing: missingRecords,
  };
};
