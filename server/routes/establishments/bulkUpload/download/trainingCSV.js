const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const { csvQuote } = require('../../../../utils/bulkUploadUtils');

const toCSV = (establishmentId, workerId, entity) => {
  // ["LOCALESTID","UNIQUEWORKERID","CATEGORY","DESCRIPTION","DATECOMPLETED","EXPIRYDATE","ACCREDITED","NOTES"]
  const columns = [];
  columns.push(csvQuote(establishmentId));
  columns.push(csvQuote(workerId));

  columns.push(BUDI.trainingCategory(BUDI.FROM_ASC, entity.category.id));
  columns.push(entity.title ? csvQuote(entity.title) : '');

  columns.push(convertDateFormatToDayMonthYearWithSlashes(entity.completed));
  columns.push(convertDateFormatToDayMonthYearWithSlashes(entity.expires));

  columns.push(convertAccredited(entity.accredited));
  columns.push(entity.notes ? csvQuote(decodeURI(entity.notes)) : '');

  return columns.join(',');
};

const convertDateFormatToDayMonthYearWithSlashes = (dateText) => {
  if (dateText) {
    const dateParts = String(dateText).split('-');

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }

  return '';
};

const convertAccredited = (accredited) => {
  if (accredited === 'Yes') return 1;
  if (accredited === 'No') return 0;
  if (accredited === "Don't know") return 999;

  return '';
};

module.exports = {
  toCSV,
  convertDateFormatToDayMonthYearWithSlashes,
  convertAccredited,
};
