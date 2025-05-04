// rules/checkMissingHashIncludeStatements.js
export default class CheckMissingHashIncludeStatements {
    check(parsedCode) {
        let issues = [];

        parsedCode.ast.forEach(statements => {

            if (statements.type !== 'IncludeBlockStatement') return issues;

            statements.value.forEach(statement => {
                if (statement.type === 'IncludeStatement' && !statement.hasHash) {
                    issues.push({
                        type: 'Error',
                        message: `Missing '#' at the beginning of 'IncludeStatement'`,
                    });
                }
                if (statement.type !== 'IncludeStatement') {
                    issues.push({
                        type: 'Error',
                        message: `Not allowed statement within 'IncludeBlockStatement'`,
                    });
                }
            });

        });
        return issues;
    }
}