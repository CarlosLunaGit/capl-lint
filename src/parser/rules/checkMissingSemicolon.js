// rules/checkMissingSemicolon.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class CheckMissingSemicolon {
    check(parsedCode, parser) {
        const issues = [];

        traverseAST(parsedCode.ast, (node) => {
            if (['StructMemberVariableInitialization', 'VariableDeclaration', 'ReturnStatement'].includes(node.type)) {
                if (!node.hasSemicolon) {
                    issues.push({
                        type: 'Error',
                        message: `Missing semicolon at the end of '${node.type}': ${node.name}`,
                        row: node.row || 'unknown',
                        col: node.col || 'unknown',
                    });
                }
            }
        });

        return issues;
    }
}
