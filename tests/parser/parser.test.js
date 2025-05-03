// tests/parser.test.js
import Parser from '../../src/parser/parser';
const assert = require('assert');

describe('Parser', () => {
  it('should parse an if statement', () => {
    const parser = new Parser();
    const code = 'if (x) { return; }';
    const parsedCode = parser.parse(code);

    assert.deepEqual(parsedCode, [
      {
        "type": "IfStatement",
        "condition": { "type": "IDENTIFIER", "value": "x" },
        "body": [
            { "type": "ReturnStatement", "value": null }
        ]
    }
    ]);
  });

  it('should throw an error for invalid statement', () => {
    const parser = new Parser();
    const code = 'unknown { return; }';

    assert.throws(() => {
      parser.parse(code);
    }, /Unexpected statement type/);
  });
});
