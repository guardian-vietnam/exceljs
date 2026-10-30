const testXformHelper = require('../test-xform-helper');

const FilterColumnXform = verquire('xlsx/xform/table/filter-column-xform');

const expectations = [
  {
    title: 'showing filter',
    create() {
      return new FilterColumnXform();
    },
    initialModel: {filterButton: true},
    preparedModel: {colId: '0', filterButton: true},
    xml: '<filterColumn colId="0" hiddenButton="0" />',
    get parsedModel() {
      return this.initialModel;
    },
    tests: ['prepare', 'render', 'renderIn', 'parse'],
    options: {index: 0},
  },
  {
    title: 'hidden filter',
    create() {
      return new FilterColumnXform();
    },
    initialModel: {filterButton: false},
    preparedModel: {colId: '1', filterButton: false},
    xml: '<filterColumn colId="1" hiddenButton="1" />',
    get parsedModel() {
      return this.initialModel;
    },
    tests: ['prepare', 'render', 'renderIn', 'parse'],
    options: {index: 1},
  },
  {
    title: 'with custom filter',
    create() {
      return new FilterColumnXform();
    },
    initialModel: {filterButton: false, customFilters: [{val: '*brandywine*'}]},
    preparedModel: {
      colId: '0',
      filterButton: false,
      customFilters: [{val: '*brandywine*'}],
    },
    xml: '<filterColumn colId="0" hiddenButton="1"><customFilters><customFilter val="*brandywine*"/></customFilters></filterColumn>',
    get parsedModel() {
      return this.initialModel;
    },
    tests: ['prepare', 'render', 'renderIn', 'parse'],
    options: {index: 0},
  },
  {
    title: 'with color filter',
    create() {
      return new FilterColumnXform();
    },
    xml: '<filterColumn colId="52"><colorFilter dxfId="153"/></filterColumn>',
    parsedModel: {filterButton: false},
    tests: ['parse'],
  },
  {
    title: 'with nested unsupported filter',
    create() {
      return new FilterColumnXform();
    },
    xml: '<filterColumn colId="0" hiddenButton="0"><extLst><ext uri="{0}"><filter val="x"/></ext></extLst></filterColumn>',
    parsedModel: {filterButton: true},
    tests: ['parse'],
  },
];

describe('FilterColumnXform', () => {
  testXformHelper(expectations);
});
