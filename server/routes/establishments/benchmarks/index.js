const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const usage = require('./usage');
const {
  getPay,
  getQualifications,
  getSickness,
  getTurnover,
  getVacancies,
  getComparisonData,
} = require('./benchmarksService');

const CARE_WORKER_ID = 10;
const SENIOR_CARE_WORKER_ID = 25;
const REGISTERED_NURSE_ID = 23;
const REGISTERED_MANAGER_ID = 22;

const workerMap = new Map([
  [10, 8],
  [25, 7],
  [23, 16],
  [22, 4],
]);

const comparisonJson = {
  value: 0,
  hasValue: false,
  stateMessage: 'no-data',
};

const comparisonGroupsJson = {
  comparisonGroup: clonedeep(comparisonJson),
  goodCqc: clonedeep(comparisonJson),
};

const getTiles = async (establishmentId, tiles) => {
  const cssr = await models.cssr.getCSSR(establishmentId);

  let benchmarkComparisonGroup = await models.benchmarks.getBenchmarkData(establishmentId, cssr.id);
  let reply = {
    meta: {},
  };
  if (tiles.includes('pay')) reply.pay = await pay({ establishmentId }, benchmarkComparisonGroup);
  if (tiles.includes('sickness')) reply.sickness = await sickness({ establishmentId }, benchmarkComparisonGroup);
  if (tiles.includes('qualifications'))
    reply.qualifications = await qualifications({ establishmentId }, benchmarkComparisonGroup);
  if (tiles.includes('turnover')) reply.turnover = await turnover({ establishmentId }, benchmarkComparisonGroup);

  reply.meta = await getMetaData(benchmarkComparisonGroup, cssr);
  return reply;
};

const getMetaData = async (benchmarkComparisonGroup, cssr) => {
  return {
    workplaces: benchmarkComparisonGroup ? benchmarkComparisonGroup.workplaces : 0,
    staff: benchmarkComparisonGroup ? benchmarkComparisonGroup.staff : 0,
    lastUpdated: await models.dataImports.benchmarksLastUpdated(),
    localAuthority: cssr ? cssr.name : null,
  };
};

const pay = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'pay', getPay);
};

const qualifications = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'qualifications', getQualifications);
};

const sickness = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'sickness', getSickness);
};

const turnover = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'turnover', getTurnover);
};

const vacancies = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'vacancies', getVacancies);
};

const buildTile = async (params, benchmarkComparisonGroup, key, getMetricCallback) => {
  const { value, stateMessage } = await getMetricCallback(params);
  const hasValue = !stateMessage || stateMessage.length === 0;
  const json = {
    workplaceValue: {
      value: value ? value : 0,
      hasValue,
    },
    ...buildComparisonGroupMetrics(key, benchmarkComparisonGroup),
  };
  if (!hasValue) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

const buildComparisonGroupMetrics = (key, comparisonGroups) => {
  const comparisonGroupMetrics = clonedeep(comparisonGroupsJson);
  if (comparisonGroups) {
    comparisonGroupMetrics.comparisonGroup = buildMetric(comparisonGroups[key]);
    comparisonGroupMetrics.goodCqc = buildMetric(comparisonGroups[`${key}GoodCqc`]);
  }
  return comparisonGroupMetrics;
};

const buildMetric = (metricValue) => {
  const comparisonGroup = clonedeep(comparisonJson);
  comparisonGroup.value = metricValue !== undefined && metricValue !== null ? parseFloat(metricValue) : 0;
  comparisonGroup.hasValue = metricValue !== undefined && metricValue !== null;
  if (comparisonGroup.hasValue) {
    delete comparisonGroup.stateMessage;
  }
  return comparisonGroup;
};

const payBenchmarks = async (establishmentId, mainService, workerId) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksPayByLAAndService',
    ['AverageHourlyRate', 'AverageAnnualFTE', 'MainJobRole', 'BaseWorkers'],
    workerId,
  );

  const annualOrHourly = [CARE_WORKER_ID, SENIOR_CARE_WORKER_ID].includes(workerId) ? 'Hourly' : 'Annually';

  const field = annualOrHourly === 'Hourly' ? 'AverageHourlyRate' : 'AverageAnnualFTE';
  const comparisonGroups = {
    pay: comparisonGroup && comparisonGroup[field],
    payGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup[field],
  };

  return await pay({ establishmentId, mainJob: workerId, annualOrHourly }, comparisonGroups);
};

const turnoverBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksTurnoverByLAAndService',
    ['TurnoverRate'],
  );

  const comparisonGroups = {
    turnover: comparisonGroup && comparisonGroup.TurnoverRate,
    turnoverGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.TurnoverRate,
  };

  return await turnover({ establishmentId }, comparisonGroups);
};

const vacanciesBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksVacanciesByLAAndService',
    ['VacancyRate'],
  );

  const comparisonGroups = {
    turnover: comparisonGroup && comparisonGroup.VacancyRate,
    turnoverGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.VacancyRate,
  };

  return await vacancies({ establishmentId }, comparisonGroups);
};

const getComparisonGroups = async (establishmentId, mainService, benchmarksModel, attributes, workerId) => {
  const comparisonGroup = await getComparisonData(
    models[benchmarksModel],
    establishmentId,
    mainService,
    attributes,
    workerId && workerMap.get(workerId),
  );
  const comparisonGoodCqcGroup = await getComparisonData(
    models[`${benchmarksModel}GoodOutstanding`],
    establishmentId,
    mainService,
    attributes,
    workerId && workerMap.get(workerId),
  );

  return { comparisonGroup, comparisonGoodCqcGroup };
};

const getBenchmarksData = async (establishmentId, mainService) => {
  const reply = {
    meta: {},
  };

  reply.careWorkerPay = await payBenchmarks(establishmentId, mainService, CARE_WORKER_ID);
  reply.seniorCareWorkerPay = await payBenchmarks(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
  reply.registeredNursePay = await payBenchmarks(establishmentId, mainService, REGISTERED_NURSE_ID);
  reply.registeredManagerPay = await payBenchmarks(establishmentId, mainService, REGISTERED_MANAGER_ID);
  reply.vacancyRate = await vacanciesBenchmarks(establishmentId, mainService);
  reply.turnoverRate = await turnoverBenchmarks(establishmentId, mainService);

  reply.meta = await getMeta(establishmentId, mainService);

  return reply;
};

const getMeta = async (establishmentId, mainService) => {
  const benchmarksComparisonGroup = await models.benchmarksEstablishmentsAndWorkers.getComparisonData(
    establishmentId,
    mainService,
  );

  return {
    workplaces: benchmarksComparisonGroup ? benchmarksComparisonGroup.workplaces : 0,
    staff: benchmarksComparisonGroup ? benchmarksComparisonGroup.staff : 0,
    lastUpdated: await models.dataImports.benchmarksLastUpdated(),
    localAuthority: benchmarksComparisonGroup ? benchmarksComparisonGroup.localAuthority : null,
  };
};

const viewBenchmarks = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const { MainServiceFKValue: mainService } = await models.establishment.findbyId(establishmentId);

    let tiles;
    let reply;
    if ([1, 2, 8].includes(mainService)) {
      reply = await getBenchmarksData(establishmentId, mainService);
    } else {
      tiles = req.query.tiles ? req.query.tiles.split(',') : [];
      reply = await getTiles(establishmentId, tiles);
    }
    console.log(reply);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').get(viewBenchmarks);

router.use('/rankings', rankings);
router.use('/usage', usage);

module.exports = router;
module.exports.pay = pay;
module.exports.qualifications = qualifications;
module.exports.sickness = sickness;
module.exports.turnover = turnover;
module.exports.buildComparisonGroupMetrics = buildComparisonGroupMetrics;
module.exports.getMetaData = getMetaData;
