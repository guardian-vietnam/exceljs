const ExcelJS = verquire('exceljs');

const DATA = './spec/integration/data';

async function loadAndRoundTrip(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(`${DATA}/${file}`);
  const copy = new ExcelJS.Workbook();
  await copy.xlsx.load(await workbook.xlsx.writeBuffer());
  return {workbook, copy};
}

const firstRows = (worksheet, columns = 4) =>
  [1, 2, 3].map(n => worksheet.getRow(n).values.slice(1, columns + 1));

describe('Guardian: files written by other generators', () => {
  const vendorRows = [
    ['No.', 'VENDOR CODE', 'VENDOR', 'Brand'],
    [1, 'V1000', 'Vendor 0', 'Brand 0'],
    [2, 'V1001', 'Vendor 1', 'Brand 1'],
  ];

  it('reads a table filtered by color', async () => {
    const {workbook, copy} = await loadAndRoundTrip('guardian-table-color-filter.xlsx');
    expect(firstRows(workbook.getWorksheet('Data'))).to.deep.equal(vendorRows);
    expect(firstRows(copy.getWorksheet('Data'))).to.deep.equal(vendorRows);
  });

  it('reads rows and cells without an r attribute', async () => {
    const {workbook, copy} = await loadAndRoundTrip('guardian-no-cell-refs.xlsx');
    expect(firstRows(workbook.getWorksheet('Data'))).to.deep.equal(vendorRows);
    expect(firstRows(copy.getWorksheet('Data'))).to.deep.equal(vendorRows);
  });

  it('reads SpreadsheetML bound to a prefix (<x:worksheet>)', async () => {
    const {workbook, copy} = await loadAndRoundTrip('guardian-x-prefixed.xlsx');
    expect(firstRows(workbook.getWorksheet('Data'))).to.deep.equal(vendorRows);
    expect(firstRows(copy.getWorksheet('Data'))).to.deep.equal(vendorRows);
  });

  it('reads tables linked with package-absolute targets (openpyxl)', async () => {
    const {workbook, copy} = await loadAndRoundTrip('guardian-openpyxl-table.xlsx');
    const rows = [
      ['Code', 'Qty'],
      ['A', 1],
      ['B', 2],
    ];
    expect(firstRows(workbook.getWorksheet('Data'))).to.deep.equal(rows);
    expect(Object.keys(workbook.getWorksheet('Data').tables)).to.have.length(1);
    expect(firstRows(copy.getWorksheet('Data'))).to.deep.equal(rows);
  });

  it('writes back an x14 cellIs rule whose formula is in <xm:f>', async () => {
    const {workbook, copy} = await loadAndRoundTrip('guardian-x14-cellis.xlsx');
    const rule = workbook.getWorksheet('Data').conditionalFormattings[0].rules[0];
    expect(rule.type).to.equal('cellIs');
    expect(rule.formulae).to.deep.equal(['5']);
    expect(copy.getWorksheet('Data').getCell('A3').value).to.equal(9);
  });

  it('keeps carriage returns in text through a round trip', async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.getCell('A1').value = 'line 1\r\nline 2';
    worksheet.getCell('A2').value = {richText: [{text: 'a\r\nb'}]};

    const copy = new ExcelJS.Workbook();
    await copy.xlsx.load(await workbook.xlsx.writeBuffer());

    expect(copy.getWorksheet('Data').getCell('A1').value).to.equal('line 1\r\nline 2');
    expect(copy.getWorksheet('Data').getCell('A2').value.richText[0].text).to.equal('a\r\nb');
  });
});
