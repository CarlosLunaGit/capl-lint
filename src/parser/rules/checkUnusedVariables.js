// checkUnusedVariables.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class CheckUnusedVariables {
    check(parsedCode, parser) {
        const warnings = [];
        let itemPrefix = "";
        const variables = parser.scopeManager.getAllVariables();

        parser.scopeManager.logAllScopesVariables();

        for (const variable of variables) {
            const { name, wasDeclared, wasUsed, row, col, partialDeclaration, type } = variable;
            //TODO: Handle the variables with indirect calls like in Struct type used defined variables where the CALLEDIN property is > 0
            if (type === "TESTCASE" || type === "FUNCTION") {
                itemPrefix = "Test Case";
            }else{
                itemPrefix = "Variable";
            }
            if (partialDeclaration === false)
            {
                if (wasDeclared && !wasUsed) {
                    warnings.push({
                        message: `${itemPrefix} '${name}' is DECLARED but never USED.`,
                        row: row || 1,
                        col: col || 1,
                        type: "Warning"
                    });
                }

                if (!wasDeclared && wasUsed) {
                    warnings.push({
                        message: `${itemPrefix} '${name}' is USED but never DECLARED.`,
                        row: row || 1,
                        col: col || 1,
                        type: "Error"
                    });
                }
            }
            else
            {
                if (wasDeclared && !wasUsed) {
                    warnings.push({
                        message: `${itemPrefix} '${name}' is PARTIALLY DECLARED but never USED (EDGE CASE TBD).`,
                        row: row || 1,
                        col: col || 1,
                        type: "Warning"
                    });
                }

                if (!wasDeclared && wasUsed) {
                    warnings.push({
                        message: `${itemPrefix} '${name}' is USED but Partially Declared, Make sure it is Declared on any of the include references.`,
                        row: row || 1,
                        col: col || 1,
                        type: "Info"
                    });
                }
            }

        }

        return warnings;
    }
}
