// rules/checkMissingSemicolon.js
export default class CheckMissingSemicolon {
    check(parsedCode, parser) {

        let issues = [];

        parsedCode.ast.forEach(statement => {
            if (['StructMemberVariableInitialization', 'VariableDeclaration', 'ReturnStatement'].includes(statement.type) && !statement.hasSemicolon) {
                issues.push({
                  type: 'Error',
                  message: `Missing semicolon at the end of '${statement.type}'`,
                  row: statement.row || 'unknown',
                  col: statement.col || 'unknown'
                });
              }

        });
        return issues;
    }
}
