import { Language, Status } from '@prisma/client';
import { t } from '@utils';

export const getStatus = (language?: Language) => {
  return Object.values(Status).map((value) => {
    return {
      name: t(value, language),
      code: value,
    };
  });
};
