const BaseXform = require('../base-xform');

class TableColumnXform extends BaseXform {
  get tag() {
    return 'tableColumn';
  }

  prepare(model, options) {
    model.id = options.index + 1;
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      id: model.id.toString(),
      name: model.name,
      totalsRowLabel: model.totalsRowLabel,
      totalsRowFunction: model.totalsRowFunction,
      dxfId: model.dxfId,
    });
    if (model.calculatedColumnFormula) {
      xmlStream.leafNode('calculatedColumnFormula', undefined, model.calculatedColumnFormula);
    }
    xmlStream.closeNode();
    return true;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      const {attributes} = node;
      this.model = {
        name: attributes.name,
        totalsRowLabel: attributes.totalsRowLabel,
        totalsRowFunction: attributes.totalsRowFunction,
        dxfId: attributes.dxfId,
      };
      this.childTag = null;
      return true;
    }
    // Child elements (calculatedColumnFormula, totalsRowFormula, xmlColumnPr,
    // extLst, ...) must not end the column: the stock parser returned false
    // here, which dropped every following column of the table.
    if (!this.childTag) {
      this.childTag = node.name;
      this.childText = '';
    }
    return true;
  }

  parseText(text) {
    if (this.childTag) {
      this.childText += text;
    }
  }

  parseClose(name) {
    if (name === this.tag) {
      return false;
    }
    if (name === this.childTag) {
      if (name === 'calculatedColumnFormula') {
        this.model.calculatedColumnFormula = this.childText;
      }
      this.childTag = null;
    }
    return true;
  }
}

module.exports = TableColumnXform;
