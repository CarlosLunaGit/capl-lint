// rules/UnusedVariableRule.js
export default class UnusedVariableRule {
    check(parsedCode, parser) {
      let issues = [];

      // This example assumes that parsedCode contains all declared variables and usage information
      parsedCode.ast.forEach(statement => {
        if (statement.type === 'VariableDeclaration' ) {

            for (let index = 0; index < parser.declaredVariables.size; index++) {
                if (parser.declaredVariables.get(statement.variableName).wasUsed !== true) {
                    issues.push({
                        type: 'Warning',
                        message: `Unused variable: ${statement.variableName}`
                    });
                    break;
                }

            }

        }
      });

      return issues;
    }
  }