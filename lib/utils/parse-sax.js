const {SaxesParser} = require('saxes');
const {PassThrough} = require('readable-stream');
const {bufferToString} = require('./browser-buffer-decode');

const SPREADSHEETML_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

module.exports = async function* (iterable) {
  // TODO: Remove once node v8 is deprecated
  // Detect and upgrade old streams
  if (iterable.pipe && !iterable[Symbol.asyncIterator]) {
    iterable = iterable.pipe(new PassThrough());
  }
  const saxesParser = new SaxesParser();
  let error;
  saxesParser.on('error', err => {
    error = err;
  });
  let events = [];
  // Some generators (OpenXML SDK) bind SpreadsheetML to a prefix: <x:worksheet xmlns:x="...main">.
  // Strip that prefix so the xforms see the usual element names.
  let mainPrefix;
  const unprefix = value => {
    if (mainPrefix && value.name.startsWith(mainPrefix)) {
      // copy: saxes keeps the original tag object to match the closing tag
      return Object.assign({}, value, {name: value.name.slice(mainPrefix.length)});
    }
    return value;
  };
  saxesParser.on('opentag', value => {
    if (mainPrefix === undefined) {
      mainPrefix = null;
      Object.keys(value.attributes).forEach(key => {
        if (key.startsWith('xmlns:') && value.attributes[key] === SPREADSHEETML_MAIN) {
          mainPrefix = `${key.slice(6)}:`;
        }
      });
    }
    events.push({eventType: 'opentag', value: unprefix(value)});
  });
  saxesParser.on('text', value => events.push({eventType: 'text', value}));
  saxesParser.on('closetag', value => events.push({eventType: 'closetag', value: unprefix(value)}));
  for await (const chunk of iterable) {
    saxesParser.write(bufferToString(chunk));
    // saxesParser.write and saxesParser.on() are synchronous,
    // so we can only reach the below line once all events have been emitted
    if (error) throw error;
    // As a performance optimization, we gather all events instead of passing
    // them one by one, which would cause each event to go through the event queue
    yield events;
    events = [];
  }
};
