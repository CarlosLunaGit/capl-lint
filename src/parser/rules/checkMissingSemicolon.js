// rules/checkMissingSemicolon.js
export default class CheckMissingSemicolon {
    check(parsedCode) {

        let issues = [];

        parsedCode.forEach(statement => {
            if (['VariableDeclaration', 'ReturnStatement'].includes(statement.type) && !statement.hasSemicolon) {
                issues.push({
                  type: 'Error',
                  message: `Missing semicolon at the end of '${statement.type}'`,
                  line: statement.line || 'unknown'
                });
              }

        });
        return issues;
    }
}
