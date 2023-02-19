import { Gender, Language } from '@prisma/client';
import { t } from '@utils';
export { Gender } from '@prisma/client';

export const getGenders = (language?: Language) => {
  return Object.values(Gender).map((value) => {
    return {
      name: t(value, language),
      code: value,
    };
  });
};
