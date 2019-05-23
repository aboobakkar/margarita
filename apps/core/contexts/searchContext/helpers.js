// @flow

import qs from 'qs';

type ParserType = 'Location' | 'Date' | 'number' | 'string';

const PARSER_CONFIG = {
  travelFromName: 'string',
  travelToName: 'string',
  sortBy: 'string', // @TODO create sortParser
  limit: 'number',
  adults: 'number',
  infants: 'number',
  dateFrom: 'Date',
  dateTo: 'Date',
  returnDateFrom: 'Date',
  returnDateTo: 'Date',
  bookingToken: 'string',
  nightsInDestinationFrom: 'number',
  nightsInDestinationTo: 'number',
  tripType: 'string',
};

export function parseURLqueryToState(query: Object) {
  const queryKeys = Object.keys(query);
  return queryKeys.reduce((acc, key) => {
    const parserType = key.match(/travelFrom|travelTo/)
      ? 'Location'
      : PARSER_CONFIG[key];
    if (parserType) {
      const parser = getParser(parserType);
      if (parserType === 'Location') {
        const parserObj: Object = parser(query);
        return { ...parserObj, ...acc };
      }
      return { [key]: parser(query[key]), ...acc };
    }
    /* eslint-disable-next-line no-console */
    console.warn(`Unexpected URL parameter "${key}" have been detected`);
    return acc;
  }, {});
}

function getParser(parserType: ParserType) {
  switch (parserType) {
    case 'Location': {
      return locationParser;
    }
    case 'Date': {
      return dateParser;
    }
    case 'string': {
      return stringParser;
    }
    case 'number': {
      return numberParser;
    }
    default: {
      return (value: any) => value;
    }
  }
}

export function locationParser(query: Object) {
  // @TODO Location validation
  const locationsObject = qs.parse(query);
  return {
    travelFrom: locationsObject.travelFrom,
    travelTo: locationsObject.travelTo,
  };
}

function dateParser(date: string) {
  // @TODO input validation
  return new Date(date);
}

function numberParser(number: number | string) {
  // @TODO input validation
  return parseInt(number, 10);
}

function stringParser(string: string) {
  // @TODO input validation
  return string;
}
