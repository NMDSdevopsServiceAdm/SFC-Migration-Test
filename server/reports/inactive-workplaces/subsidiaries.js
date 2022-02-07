const buildRow = (parent, subsidiary) => {
  return {
    parentWorkplaceId: parent.nmdsId,
    workplace: subsidiary.name,
    workplaceId: subsidiary.nmdsId,
    lastLogin: subsidiary.lastLogin,
    dataOwner: subsidiary.dataOwner,
  };
};

const buildRows = (parent, subsidiaries) => {
  return subsidiaries.map((subsidiary) => {
    return buildRow(parent, subsidiary);
  });
};

const addWorksheet = (workbook) => {
  const subsidiaryWorksheet = workbook.addWorksheet('Subsidiary workplaces');
  subsidiaryWorksheet.columns = [
    { header: 'Parent Workplace ID', key: 'parentWorkplaceId' },
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Date last logged in', key: 'lastLogin', style: { numFmt: 'dd/mm/yyyy' } },
    { header: 'Data owner', key: 'dataOwner' },
  ];

  const subsidiaryHeaderRow = subsidiaryWorksheet.getRow(1);
  subsidiaryHeaderRow.font = { bold: true, name: 'Calibri' };

  return subsidiaryWorksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
