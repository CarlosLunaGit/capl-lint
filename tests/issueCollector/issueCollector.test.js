// tests/issueCollector.test.js
import IssueCollector from '../../src/parser/issueCollector/issueCollector';
const assert = require('assert');

describe('IssueCollector', () => {
  it('should collect and report issues', () => {
    const collector = new IssueCollector();
    collector.collect([
      { type: 'Error', message: 'Syntax error at line 3' },
      { type: 'Warning', message: 'Unused variable: x' }
    ]);

    const report = collector.report();

    assert.strictEqual(report, 'Error: Syntax error at line 3\nWarning: Unused variable: x');
  });
});
