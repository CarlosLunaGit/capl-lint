// rules/checkMissingHashIncludeStatements.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class CheckMissingHashIncludeStatements {
    check(parsedCode, parser) {
        let issues = [];

        traverseAST(parsedCode.ast, (node) => {


            if (node.type !== 'IncludeBlockStatement') return issues;

            node.body.forEach(statement => {
                if (statement.type === 'IncludeStatement' && !statement.hasHash) {
                    issues.push({
                        type: 'Error',
                        message: `Missing '#' at the beginning of 'IncludeStatement'`,
                    });
                }// TODO: Move the invalid include statements to its own class
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
