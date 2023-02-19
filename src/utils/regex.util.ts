export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEX = /^\d{2}:\d{2}$/;
export const SPECIAL_CHARACTER_WITH_NUMBER_REGEX = /[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~]+$/g;
export const SPECIAL_CHARACTER_WITHOUT_NUMBER_REGEX = /[`!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~]/;
export const NUMBER_REGEX = /^[0-9]+$/g;
export const CODE_REGEX = /^[a-zA-Z0-9_-]+$/g;
export const USERNAME_REGEX = /^[a-zA-Z0-9.-_]+$/g;
export const NAME_WITH_NUMBER_REGEX = /^[a-zA-Z0-9 ]+$/g;
export const NAME_WITHOUT_NUMBER_REGEX = /^[a-zA-Z ]+$/g;
export const PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
export const PHONE_REGEX_WITH_COUNTRY_CODE =
  // eslint-disable-next-line max-len
  /(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/g;
export const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
export const ID_CARD_NUMBER_REGEX = /^[0-9]+$/g;
export const PASSWORD_REGEX = /^[a-zA-Z0-9@$!%*#?&_-]{6,255}$/;
export const IMAGE_REGEX = /[\/.](gif|jpg|jpeg|tiff|png|webp)$/i;

export const convertFilterStringToArray = (value: string) => {
  if (value) return value?.slice(-1) === ',' ? value?.slice(0, -1)?.split(',') : value?.split(',') ?? [];
  return [];
};

export const convertVNtoNormalText = (str: string) => {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();

  // xóa dấu
  str = str
    .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, 'd');

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '');

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, '-');

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, '-');

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, '');

  // return
  return str;
};
