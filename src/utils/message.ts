import * as en from '@locales/en.json';
import * as vi from '@locales/vi.json';
import { Language } from '@prisma/client';

const TranslationCode = (mess: string, lang?: Language, options?: object) => {
  let message = '';
  switch (lang?.toUpperCase()) {
    case Language.VI:
      message = vi[mess?.toLowerCase()];
      break;
    case Language.EN:
      message = en[mess?.toLowerCase()];
      break;
    default:
      message = en[mess?.toLowerCase()];
      break;
  }

  if (options && Object.keys(options).length) {
    Object.keys(options).map((i) => {
      message = message.replace('${' + `${i}` + '}', options[i]);
    });
  }
  return message;
};
export const t = TranslationCode;
