import { t } from '@/utils/message';
import { Language } from '@prisma/client';
import { Pagination } from './pagination';

export const ResponseSuccess = (
  data: any,
  message: string,
  options: { statusCode?: number; language?: Language; pagination?: Pagination; total?: number; other?: any } = {},
) => {
  const { statusCode, language = 'EN', pagination = {}, total = 0, other } = options;
  let paginate = undefined;
  if (Object.keys(pagination).length) {
    paginate = convertPagination(pagination, total);
    // delete pagination.skip;
    // delete pagination.take;
    // const totalPage = total / pagination.pageSize;
    // const lastPage = Math.floor(totalPage) < totalPage ? Math.floor(totalPage) + 1 : Math.floor(totalPage);
    // if (pagination) paginate = { ...pagination, total, lastPage };
  }
  const messageTranslate = t(message, language);
  return {
    data,
    pagination: paginate,
    message: messageTranslate,
    statusCode: statusCode || 200,
    ...other,
  };
};

export const convertPagination = (pagination: Pagination, total: number) => {
  let paginate = undefined;
  if (pagination) {
    delete pagination.skip;
    delete pagination.take;
    const totalPage = total / pagination.pageSize;
    const lastPage = Math.floor(totalPage) < totalPage ? Math.floor(totalPage) + 1 : Math.floor(totalPage);
    if (pagination)
      paginate = {
        ...pagination,
        total,
        lastPage,
      };
  }
  return paginate;
};

export const convertTranslate = (data: any, language?: Language) => {
  let dataTmp = [];

  switch (Array.isArray(data)) {
    case true:
      let arrTmp = {};
      if (data) {
        data.map((item) => {
          if (item.translates) {
            const tmp = {};
            item.translates.map((item2) => {
              if (language) {
                if (item2.language === language) {
                  arrTmp = { [language]: { ...item2 } };
                }
              } else {
                tmp[`${item2.language}`] = { ...item2 };
                arrTmp = { ...tmp };
              }
            });
            item.translates = arrTmp;
            Object.values(item).map((i) => {
              if ((typeof i === 'object' && i !== null) || Array.isArray(i)) convertTranslate(i, language);
            });
          } else {
            Object.values(item).map((i) => {
              if ((typeof i === 'object' && i !== null) || Array.isArray(i)) convertTranslate(i, language);
            });
          }
        });
        return data;
      }
    case false:
      const tmp = [];
      if (data.translates) {
        data.translates.map((item) => {
          if (language) {
            if (item.language === language) {
              tmp[language] = { ...item };
            }
          } else {
            tmp[`${item.language}`] = { ...item };
          }
        });
        dataTmp = Object.assign(data, { translates: { ...tmp } });
        Object.values(dataTmp).map((item) => {
          if ((typeof item === 'object' && item !== null) || Array.isArray(item)) convertTranslate(item, language);
        });
      } else {
        Object.values(data).map((item) => {
          if ((typeof item === 'object' && item !== null) || Array.isArray(item)) convertTranslate(item, language);
        });
      }
      return data;
    default:
      break;
  }
};
