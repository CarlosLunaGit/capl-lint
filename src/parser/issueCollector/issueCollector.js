// IssueCollector.js
export default class IssueCollector {
    constructor() {
      this.issues = [];
    }

    collect(issues) {
      this.issues.push(...issues);
    }

    report() {
      // You can also expand this to output to a file or console in various formats
      return this.issues.map(issue => `${issue.type}: ${issue.message}`).join('\n');
    }
  }
