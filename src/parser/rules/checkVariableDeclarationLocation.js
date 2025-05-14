// rules/checkVariableDeclarationLocation.js
import { traverseAST } from '../../utils/traverseAST.js';

export default class CheckVariableDeclarationLocation {

    check(parsedCode, parser) {
        const issues = [];
        const regex = /[B-b]lock/g;

        traverseAST(parsedCode.ast, (node) => {
            let blockFound = node.type.match(regex);
            // console.log(blockFound);
            // console.log(node);

            if (blockFound !== null) {
                let variableDeclarationFlag = false;
                let firstNonVariableDeclarationStatement = false;

                node.body.forEach(element => {

                    if (element.type !== 'VariableDeclaration') {
                        firstNonVariableDeclarationStatement = true;
                        variableDeclarationFlag = false;
                    }

                    if (element.type === 'VariableDeclaration') {
                        variableDeclarationFlag = true;
                    }

                    if (firstNonVariableDeclarationStatement === true && variableDeclarationFlag === true)
                    {
                        issues.push({
                            type: 'Error',
                            message: `Variable declarations should happen at the start of a block. Misplaced variable: ${element.name}`,
                            row: element.row || 'unknown',
                            col: element.col || 'unknown',
                        });
                    }



                });

            }

        });

        return issues;
    }
}
