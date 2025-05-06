// rules/UnusedVariableRule.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class UnusedVariableRule {
    check(parsedCode, parser) {
        const issues = [];

        traverseAST(parsedCode.ast, (node) => {
            if (node.type === 'VariableDeclaration') {
                const varMeta = parser.declaredVariables.get(node.variableName);
                if (varMeta && !varMeta.wasUsed) {
                    issues.push({
                        type: 'Warning',
                        message: `Unused variable: ${node.variableName}`,
                        row: node.row || 'unknown',
                        col: node.col || 'unknown',
                    });
                }
            }
        });

        return issues;
    }
}
