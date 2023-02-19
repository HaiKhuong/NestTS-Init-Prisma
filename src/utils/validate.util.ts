import { Gender, Language } from '@prisma/client';
import * as moment from 'moment';
import { t } from './message';

export const validateGender = (value: string) => {
  // Check gender'
  let tmp = '';
  switch (value) {
    case t(Gender.FEMALE, Language.VI):
    case t(Gender.FEMALE, Language.EN):
      tmp = Gender.FEMALE;
      break;
    case t(Gender.MALE, Language.VI):
    case t(Gender.MALE, Language.EN):
      tmp = Gender.MALE;
      break;
    case t(Gender.OTHER, Language.VI):
    case t(Gender.OTHER, Language.EN):
      tmp = Gender.OTHER;
      break;
    default:
      break;
  }
  return tmp;
};

export const validateDateFormat = (value: string | Date) => {
  return value
    ? moment(value, 'MM/DD/YYYY').isValid()
      ? moment(value, 'MM/DD/YYYY').format('MM/DD/YYYY')
      : moment(value).format('MM/DD/YYYY')
    : undefined;
};

export const convertDateFormat = (value: string | Date) => {
  return value
    ? moment(value, 'MM/DD/YYYY').isValid()
      ? moment(value, 'MM/DD/YYYY').toDate()
      : moment(value).toDate()
    : undefined;
};
