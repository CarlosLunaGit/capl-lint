// checkFunctionUnsupportedTypes.js
import { traverseAST } from '../../utils/traverseAST.js';

const SUPPORTED_TYPES = ['INT', 'DWORD', 'BYTE', 'FLOAT', 'STRING', 'TESTCASE']; // Add your supported types here

export default class CheckFunctionUnsupportedTypes {
    check(parsedCode, parser) {
        const errors = [];

        traverseAST(parsedCode.ast, (node) => {
            // Check for function or testcase declarations with unsupported types (e.g., array types)
            if (node.type === 'FunctionDeclaration' &&
                !SUPPORTED_TYPES.includes(node.returnType)) {

                errors.push({
                    type: 'Error',
                    message: `Unsupported return type (${node.returnType}) in '${node.type}': ${node.name}`,
                    row: node.row || 1,
                    col: node.col || 1
                });
            }

            // Optionally, check parameter types for arrays

        });

        return errors;
    }
}