import * as excel from 'excel4node';

const styleExcel = () => {
  const workbook = new excel.Workbook();

  const defaultStyleExcel = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12,
    },
  });

  const headerStyleExcel = workbook.createStyle({
    font: {
      bold: true,
      color: '#000000',
      size: 12,
    },
    alignment: { horizontal: 'center' },
  });

  const errorStyleExcel = workbook.createStyle({
    font: {
      color: '#FFFFFF',
      size: 12,
    },
    fill: {
      type: 'pattern',
      bgColor: '#FF0000',
      patternType: 'solid',
    },
  });

  return {
    defaultStyleExcel,
    headerStyleExcel,
    errorStyleExcel,
  };
};

export const { defaultStyleExcel, headerStyleExcel, errorStyleExcel } = styleExcel();
