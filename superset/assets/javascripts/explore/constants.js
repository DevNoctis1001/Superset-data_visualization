export const AGGREGATES = {
  AVG: 'AVG',
  COUNT: 'COUNT ',
  COUNT_DISTINCT: 'COUNT_DISTINCT',
  MAX: 'MAX',
  MIN: 'MIN',
  SUM: 'SUM',
};

export const sqlaAutoGeneratedMetricRegex = /^(LONG|DOUBLE|FLOAT)?(SUM|AVG|MAX|MIN|COUNT)\([A-Z_][A-Z0-9_]*\)$/i;
export const druidAutoGeneratedMetricRegex = /^(LONG|DOUBLE|FLOAT)?(SUM|MAX|MIN|COUNT)\([A-Z_][A-Z0-9_]*\)$/i;

