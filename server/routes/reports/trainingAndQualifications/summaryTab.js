const { convertWorkerTrainingBreakdowns, getTrainingTotals } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setCellTextAndBackgroundColour,
  setTableHeadingsStyle,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const rawWorkerTrainingBreakdowns = await models.worker.workersAndTraining(establishmentId, true);
  const workerTrainingBreakdowns = convertWorkerTrainingBreakdowns(rawWorkerTrainingBreakdowns);

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addContentToSummaryTab(summaryTab, workerTrainingBreakdowns);
};

const addContentToSummaryTab = (summaryTab, workerTrainingBreakdowns) => {
  const trainingRecordTotals = getTrainingTotals(workerTrainingBreakdowns);

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');

  createAllTrainingRecordsTable(summaryTab, trainingRecordTotals);

  let currentLineNumber = 13;

  const expiringSoonTable = createExpiringSoonTable(summaryTab, currentLineNumber, trainingRecordTotals.expiringSoon);
  const expiringSoonTableLength = addRowsToExpiringSoonTable(workerTrainingBreakdowns, expiringSoonTable);

  currentLineNumber += expiringSoonTableLength + 2;
  const expiredTable = createExpiredTable(summaryTab, currentLineNumber, trainingRecordTotals.expired);
  const expiredTableLength = addRowsToExpiredTable(workerTrainingBreakdowns, expiredTable);

  currentLineNumber += expiredTableLength + 2;
  const missingTable = createMissingTable(summaryTab, currentLineNumber, trainingRecordTotals.missing);
  addRowsToMissingTable(workerTrainingBreakdowns, missingTable);

  setColumnWidths(summaryTab);
  addBordersToAllTables(summaryTab);
};

const createAllTrainingRecordsTable = (tab, trainingRecordTotals) => {
  setHeadingAndTotalRowStyles(tab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D', 'E']);

  const allTrainingRecordsTable = tab.addTable({
    name: 'allTrainingRecordsTable',
    ref: 'B6',
    headerRow: true,
    columns: [
      { name: 'All training records', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [
      [
        'Total',
        trainingRecordTotals.total.totalRecords,
        trainingRecordTotals.total.mandatory,
        trainingRecordTotals.total.nonMandatory,
      ],
      [
        'Up-to-date',
        trainingRecordTotals.upToDate.total,
        trainingRecordTotals.upToDate.mandatory,
        trainingRecordTotals.upToDate.nonMandatory,
      ],
      [
        'Expiring soon',
        trainingRecordTotals.expiringSoon.total,
        trainingRecordTotals.expiringSoon.mandatory,
        trainingRecordTotals.expiringSoon.nonMandatory,
      ],
      [
        'Expired',
        trainingRecordTotals.expired.total,
        trainingRecordTotals.expired.mandatory,
        trainingRecordTotals.expired.nonMandatory,
      ],
    ],
  });

  setCellTextAndBackgroundColour(tab, 'B8', backgroundColours.green, textColours.green);
  setCellTextAndBackgroundColour(tab, 'B9', backgroundColours.yellow, textColours.yellow);
  setCellTextAndBackgroundColour(tab, 'B10', backgroundColours.red, textColours.red);

  return allTrainingRecordsTable;
};

const createExpiringSoonTable = (tab, lineNumber, expiringTrainingTotals) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, backgroundColours.yellow, textColours.yellow, ['B', 'C', 'D', 'E']);

  return tab.addTable({
    name: 'expiringSoonTable',
    ref: 'B' + lineNumber,
    headerRow: true,

    columns: [
      { name: 'Expiring soon', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [
      ['Total', expiringTrainingTotals.total, expiringTrainingTotals.mandatory, expiringTrainingTotals.nonMandatory],
    ],
  });
};

const createExpiredTable = (tab, lineNumber, expiredTrainingTotals) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, backgroundColours.red, textColours.red, ['B', 'C', 'D', 'E']);

  return tab.addTable({
    name: 'expiredTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Expired', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [['Total', expiredTrainingTotals.total, expiredTrainingTotals.mandatory, expiredTrainingTotals.nonMandatory]],
  });
};

const createMissingTable = (tab, lineNumber, totalMissingMandatoryTraining) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, backgroundColours.red, textColours.red, ['B', 'C']);

  const missingTable = tab.addTable({
    name: 'missingTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Missing', filterButton: false },
      { name: 'Total', filterButton: false },
    ],
    rows: [['Total', totalMissingMandatoryTraining]],
  });
  return missingTable;
};

const addRowsToExpiringSoonTable = (workers, expiringSoonTable) => {
  let tableLength = 2;

  for (let worker of workers) {
    if (worker.expiringTrainingCount > 0) {
      tableLength += 1;

      expiringSoonTable.addRow([
        worker.name,
        worker.expiringTrainingCount,
        worker.expiringMandatoryTrainingCount,
        worker.expiringNonMandatoryTrainingCount,
      ]);
    }
  }

  expiringSoonTable.commit();
  return tableLength;
};

const addRowsToExpiredTable = (workers, expiredTable) => {
  let tableLength = 2;

  for (let worker of workers) {
    if (worker.expiredTrainingCount > 0) {
      tableLength += 1;

      expiredTable.addRow([
        worker.name,
        worker.expiredTrainingCount,
        worker.expiredMandatoryTrainingCount,
        worker.expiredNonMandatoryTrainingCount,
      ]);
    }
  }

  expiredTable.commit();
  return tableLength;
};

const addRowsToMissingTable = (workers, missingTable) => {
  for (let worker of workers) {
    if (worker.missingMandatoryTrainingCount > 0) {
      missingTable.addRow([worker.name, worker.missingMandatoryTrainingCount]);
    }
  }

  missingTable.commit();
};

const setColumnWidths = (tab) => {
  const firstColumn = tab.getColumn(2);
  const totalColumn = tab.getColumn(3);
  const mandatoryColumn = tab.getColumn(4);
  const nonMandatoryColumn = tab.getColumn(5);

  firstColumn.width = 24;
  totalColumn.width = 18;
  mandatoryColumn.width = 18;
  nonMandatoryColumn.width = 18;
};

const setHeadingAndTotalRowStyles = (tab, currentLineNumber, backgroundColour, textColour, cellColumns) => {
  setTableHeadingsStyle(tab, currentLineNumber, backgroundColour, textColour, cellColumns);

  tab.getRow(currentLineNumber + 1).style = { font: { bold: true } };
};

const addBordersToAllTables = (tab) => {
  tab.eachRow(function (row, _rowNumber) {
    if (_rowNumber > 5) {
      row.eachCell(function (cell) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });
};

module.exports.generateSummaryTab = generateSummaryTab;
