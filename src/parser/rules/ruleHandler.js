// RuleHandler.js
export default class RuleHandler {
    constructor() {
      this.rules = [];
    }

    addRule(rule) {
      this.rules.push(rule);
    }

    runRules(parsedCode, parser) {
      let issues = [];

      // Apply each rule to the parsed code
      this.rules.forEach(rule => {
        issues = issues.concat(rule.check(parsedCode, parser));
      });

      return issues;
    }
  }