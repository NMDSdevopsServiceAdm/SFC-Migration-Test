const workerHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CHGUNIQUEWRKID',
  'STATUS',
  'DISPLAYID',
  'NINUMBER',
  'POSTCODE',
  'DOB',
  'GENDER',
  'ETHNICITY',
  'NATIONALITY',
  'BRITISHCITIZENSHIP',
  'COUNTRYOFBIRTH',
  'YEAROFENTRY',
  'DISABLED',
  'CARECERT',
  'RECSOURCE',
  'STARTDATE',
  'STARTINSECT',
  'APPRENTICE',
  'EMPLSTATUS',
  'ZEROHRCONT',
  'DAYSSICK',
  'SALARYINT',
  'SALARY',
  'HOURLYRATE',
  'MAINJOBROLE',
  'MAINJRDESC',
  'CONTHOURS',
  'AVGHOURS',
  'NMCREG',
  'NURSESPEC',
  'AMHP',
  'SCQUAL',
  'NONSCQUAL',
  'QUALACH01',
  'QUALACH01NOTES',
  'QUALACH02',
  'QUALACH02NOTES',
  'QUALACH03',
  'QUALACH03NOTES',
];

exports.workerHeadersWithCHGUNIQUEWRKID = workerHeaders.join(',');
exports.workerHeadersWithoutCHGUNIQUEWRKID = workerHeaders.filter((header) => header !== 'CHGUNIQUEWRKID').join(',');
