const testXformHelper = require('../test-xform-helper');

const TableColumnXform = verquire('xlsx/xform/table/table-column-xform');

const expectations = [
  {
    title: 'label',
    create() {
      return new TableColumnXform();
    },
    preparedModel: {id: 1, name: 'Foo', totalsRowLabel: 'Bar'},
    xml: '<tableColumn id="1" name="Foo" totalsRowLabel="Bar" />',
    parsedModel: {name: 'Foo', totalsRowLabel: 'Bar'},
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'function',
    create() {
      return new TableColumnXform();
    },
    preparedModel: {id: 1, name: 'Foo', totalsRowFunction: 'Baz'},
    xml: '<tableColumn id="1" name="Foo" totalsRowFunction="Baz" />',
    parsedModel: {name: 'Foo', totalsRowFunction: 'Baz'},
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'calculated column formula',
    create() {
      return new TableColumnXform();
    },
    preparedModel: {id: 1, name: 'No.', calculatedColumnFormula: 'ROW()-7'},
    xml: '<tableColumn id="1" name="No."><calculatedColumnFormula>ROW()-7</calculatedColumnFormula></tableColumn>',
    parsedModel: {name: 'No.', calculatedColumnFormula: 'ROW()-7'},
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'unknown child elements',
    create() {
      return new TableColumnXform();
    },
    xml: '<tableColumn id="1" name="Foo"><xmlColumnPr mapId="1" xpath="/a/b"/><extLst><ext uri="x"><y/></ext></extLst></tableColumn>',
    parsedModel: {name: 'Foo'},
    tests: ['parse'],
  },
];

describe('TableColumnXform', () => {
  testXformHelper(expectations);
});
