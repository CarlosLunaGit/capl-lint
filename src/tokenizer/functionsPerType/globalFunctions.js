import * as scan from "../scan.js"
import * as errorHandler from '../../parser/errors.js';

/**
 * @brief Adds a token to a specified property of a parent block.
 *
 * @param {Object} parser - The parser object.
 * @param {Object} token - The token to be added.
 * @param {string} property - The property of the parent block to which the token should be added.
 *
 * @return None.
 */
export function addToBlockProperty(parser, token, property){
    let parentBlock

    if (parser.tokenizer.branchController.getCurrentBranch() != '') {
        parentBlock = parser.tokens.filter(function (element) {
            return element.path == parser.tokenizer.branchController.getCurrentBranch()
                && (element.kind.includes('IncludesBlock')
                || element.kind.includes('VariablesBlock')
                || element.kind.includes('FunctionsBlock')
                || element.kind.includes('ifCall')
                || element.kind.includes('elseCall')
                || element.kind.includes('elseIfCall')
                || element.kind.includes('forLoopCall'));
        });

        for (let index = parentBlock.length - 1; index >= 0; index--) {
            if (!parentBlock[index].closedBlock) {
                if (property === 'body') {
                    parentBlock[index][property] = parentBlock[index][property] + JSON.stringify(token);
                    if (parser.tokenizer.BlockWithoutBrackets === true) {
                        token.parentBlockIndentation = parentBlock[index].col;
                    }
                } else if (property === 'closeCurly') {
                    parentBlock[index].body = parentBlock[index].body + JSON.stringify(token);
                    parentBlock[index][property] = token.tokenMatch.closeCurly;
                    parentBlock[index].closedBlock = true;
                }
                if (parentBlock[index].kind.includes('IncludesBlock')) {
                    token.isInclude = true;
                }
                if (parentBlock[index].kind.includes('VariablesBlock')) {
                    token.isVariable = true;
                }
                break;
            }
        }
    }
}

