import { ForbiddenException } from '@nestjs/common';
import { Language } from '@prisma/client';
import { t } from '@utils';
import { camelCase } from 'change-case';
import * as excel from 'excel4node';
import * as fs from 'fs';
import * as https from 'https';
import * as moment from 'moment';

export const flatObjectField = (data: any, name: string = null) => {
  if (!data || (typeof data !== 'object' && Object.keys(data).length)) return data;

  for (const key in data) {
    const val = data[key];
    const newName = camelCase(`${name || ''} ${key}`);
    const temp = flatObjectField(val, newName);

    if (val === temp && name) {
      if (temp && typeof temp === 'object' && Object.keys(temp).length) {
        data = {
          ...data,
          ...temp,
        };
      } else {
        data[newName] = val;
      }
      delete data[key];
    } else if (temp && typeof temp === 'object' && Object.keys(temp).length) {
      delete data[key];
      data = {
        ...data,
        ...temp,
      };
    }
  }
  return data;
};

export const createDownloadFileExcel = async (
  data: any[],
  defaultExcelColDownload: any,
  defaultName: string,
  language?: Language,
) => {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  const style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12,
    },
    numberFormat: '$#,##0.00; ($#,##0.00); -',
  });

  const dataConvert = data.map((i) => flatObjectField(i));
  Object.keys(defaultExcelColDownload).map((i: string, indexCol: number) => {
    worksheet
      .cell(1, indexCol + 1)
      .string(t(camelCase(`${defaultName} ${i}`), language))
      .style(style);
  });
  Object.values(dataConvert).map((item: any, indexRow: number) => {
    Object.keys(defaultExcelColDownload).map((i: string, indexCol: number) => {
      const data =
        typeof item[i] === 'object' && item[i] !== null ? moment(item[i]).format('DD/MM/YYYY') : item[i] || '';
      worksheet
        .cell(indexRow + 2, indexCol + 1)
        .string(`${data}`)
        .style(style);
    });
  });
  return await workbook.writeToBuffer().then(function (buffer) {
    return buffer;
  });
};

/**
 *
 * @param values
 * @param valuesCheck
 * @returns
 */
export const checkMultipleExist = (values: any[], valuesCheck: any[]) => {
  return valuesCheck.every((value) => {
    return values.includes(value);
  });
};

/**
 *
 * @param values
 * @returns
 */
export const findIdDuplicate = (values: string[]) => {
  const set = new Set(values);
  return values.filter((item) => {
    if (set.has(item)) {
      set.delete(item);
    } else {
      return item;
    }
  });
};

export const filterDataObjectUndefined = (value: object | any) => {
  if (value && typeof value === 'object' && Object.keys(value).length) {
    for (const key in value) {
      const val = filterDataObjectUndefined(value[key]);
      if (val) {
        value[key] = val;
      } else {
        delete value[key];
      }
    }
    if (!Object.keys(value).length) {
      return undefined;
    }
  }
  return value || undefined;
};

export const convertUrlGoogleDrive = (url: string) => {
  const rg = new RegExp(/.*(drive\.google\.com){1}.*(\/file\/d\/){1}/);
  const gDriveValid = rg.test(url);
  if (gDriveValid) {
    const _id = String(url)
      .replace(rg, '')
      .replace(/(\/).*/, '');
    return `https://drive.google.com/u/0/uc?id=${_id}`;
  }
  return url;
};

export const validateNotNullable = (data) => {
  const result = [...new Set(Object.values(data).map((i) => Boolean(i)))] || [];
  if (result?.length > 1) {
    return false;
  }
  return result?.[0];
};

export const convertFromListToTree = (listData: any, key: string) => {
  //Flatten array
  const newListMenuPermission = listData.reduce((newList: any[], menuPermission: any) => {
    newList.push({
      ...menuPermission,
    });
    return newList;
  }, []) as any[];

  //Combine children menu
  function combineChildrenMenuPermission(parentId: string) {
    const menuPermissions = [];
    for (let i = 0; i < newListMenuPermission.length; i++) {
      if (newListMenuPermission[i][key] === parentId) {
        const children = combineChildrenMenuPermission(newListMenuPermission[i].id);
        menuPermissions[newListMenuPermission[i].id] = {
          ...newListMenuPermission[i],
          children,
        };
      }
    }
    return Object.values(menuPermissions);
  }
  return combineChildrenMenuPermission(newListMenuPermission[0]?.[key]);
};

export const convertPageToMenuPermissions = (listData: any) => {
  //Flatten array
  return listData.reduce(function (p, v) {
    if (v.type === 'ITEM'.toLowerCase()) p.push(v);
    if (v.type === 'COLLAPSE'.toLowerCase()) {
      p = p.concat(convertPageToMenuPermissions(v.children));
      delete v.children;
      p.push(v);
    }
    return p;
  }, []);
};

export const generateUniqueString = (): string => {
  const ts = new Date().getTime().toString();
  let out = '';
  let i = 0;

  while (i < ts.length) {
    let gap = 10;
    if (parseInt(ts.substring(i, i + gap)) > 1295) gap = 9;

    out += parseInt(ts.substring(i, i + gap)).toString(36);
    i += gap;
  }

  return out.toUpperCase();
};

export const validateRoleAllow = async (
  listData: any[],
  currentPath: string,
  roleAllow: { role?: string; specialRole?: string },
  language?: Language,
) => {
  const { role = '', specialRole = '' } = roleAllow;
  const itemPermission = listData.filter((e) => currentPath.includes(e.path));

  if (!itemPermission?.length) throw new ForbiddenException(t('FORBIDDEN', language));

  const per = await itemPermission.map((i) => {
    if (i.all) return true;
    if (!i.view) return false;
    return i[role.toLowerCase()];
  });

  if ([...new Set(per)].length === 1) {
    if ([...new Set(per)][0]) {
      if (specialRole) {
        // Check Special role Allow
        const special = await Promise.all(
          itemPermission.map(async (i) => {
            if (i.specialPermissions.length) {
              return await i.specialPermissions.map((e) => e.type);
            }
          }),
        );
        if ([...new Set(special.flat())].includes(specialRole)) return true;
        else throw new ForbiddenException(t('FORBIDDEN', language));
      }
      return true;
    } else throw new ForbiddenException(t('FORBIDDEN', language));
  }

  return true;
};

export const generateCodeBase32 = (prefix: string, total: number) => {
  const code = Number(total + 1)
    .toString(32)
    .toUpperCase();
  return `${prefix}${('000000' + code).slice(prefix.length > 2 ? -4 : -6)}`;
};

export const generateCodeTransaction = () => {
  return `${moment().format('DDMMYY')}-${moment().valueOf()}`;
};

export const downloadAndUploadS3 = async (filename: string, url: string) => {
  return new Promise((resolve, reject) => {
    try {
      // if (!fs.existsSync('tmp')) {
      //   fs.mkdirSync('tmp', { recursive: true });
      // }
      const file = fs.createWriteStream(filename).on('close', () => resolve(true));
      https
        .get(url, function (response) {
          const { statusCode } = response;
          if (statusCode === 200) {
            response.pipe(file);
          } else {
            fs.unlinkSync(filename);
            return resolve(false);
          }
        })
        .addListener('error', () => {
          fs.unlinkSync(filename);
          return resolve(false);
        });
    } catch (e) {
      return resolve(false);
    }
  });
};

export const numberToColumn = (n) => {
  const res = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[n % 26];
  return n >= 26 ? numberToColumn(Math.floor(n / 26) - 1) + res : res;
};

export const getIdPageWithFbUrl = (url: string) => {
  if (url) {
    const str = url?.split('-')[url?.split('-')?.length - 1];
    const newStr = str?.replace('/', '');
    return newStr;
  }
  return '';
};

export const nonAccentVietnamese = (str: string) => {
  if (str && str !== '') {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters

    // // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\s|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '');

    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); //       huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ    Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\s|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '');
    return str;
  } else {
    return str;
  }
};
