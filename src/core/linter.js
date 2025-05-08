// Linter.js
import Parser from '../parser/parser.js';
import RuleHandler from '../parser/rules/ruleHandler.js' ;
import IssueCollector from '../parser/issueCollector/issueCollector.js';
// import UnusedVariableRule from '../parser/rules/unusedVariableRule.js';
import CheckUnusedVariables from '../parser/rules/checkUnusedVariables.js';

import CheckMissingSemicolon from '../parser/rules/checkMissingSemicolon.js';
import CheckMissingHashIncludeStatements from '../parser/rules/checkMissingHashIncludeStatements.js';

export default class Linter {
  constructor() {
    this.parser = new Parser();
    this.ruleHandler = new RuleHandler();
    this.issueCollector = new IssueCollector();
    this.ruleHandler.addRule(new CheckUnusedVariables());
    this.ruleHandler.addRule(new CheckMissingSemicolon());
    this.ruleHandler.addRule(new CheckMissingHashIncludeStatements());
  }

  lint(code) {
    const parsedCode = this.parser.parse(code);
    console.log( "[Server][Parser]: Process end");
    if (parsedCode.errors.length > 0){
        for (let index = 0; index < parsedCode.errors.length; index++) {
            console.log( "[Server][Parser][Errors]: " + parsedCode.errors[index]);

        }
    }

    const issues = this.ruleHandler.runRules(parsedCode, this.parser);
    this.issueCollector.collect(issues);

    console.log(this.issueCollector.report());

    return { errors: [...this.issueCollector.issues] };
  }
}