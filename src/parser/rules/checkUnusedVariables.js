// checkUnusedVariables.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class CheckUnusedVariables {
    check(parsedCode, parser) {
        const warnings = [];

        const variables = parser.scopeManager.getAllVariables();
        for (const variable of variables) {
            const { name, wasDeclared, wasUsed, row, col } = variable;

            if (wasDeclared && !wasUsed) {
                warnings.push({
                    message: `Variable '${name}' is DECLARED but never USED.`,
                    row: row || 1,
                    col: col || 1,
                    type: "Warning"
                });
            }

            if (!wasDeclared && wasUsed) {
                warnings.push({
                    message: `Variable '${name}' is USED but never DECLARED.`,
                    row: row || 1,
                    col: col || 1,
                    type: "Error"
                });
            }
        }

        return warnings;
    }
}
