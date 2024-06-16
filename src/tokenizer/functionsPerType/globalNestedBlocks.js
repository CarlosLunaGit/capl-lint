import * as scan from "../scan.js"
import * as errorHandler from '../../parser/errors.js';

export function eatGlobalNestedBlock(branchController, parser, token, tokenizer) {  // callable by module parser.js
    // name already registered by module parser.js
    // branchController.closedBranches = [ ] // erasing old values
    branchController.closedBranches.splice(0,branchController.closedBranches.length)
    eatNestedBlockCore(branchController, parser, token, tokenizer)
    // endGlobalFunction(branchController)
}

function eatNestedBlockCore(branchController, parser, token, tokenizer) {

    eatNestedBlockBody(tokenizer, parser, token)
}

function eatNestedBlockBody(tokenizer, parser, token) {

    let openblock = tokenizer.eatOpenBlock("NestedBlockBody", token, parser)
    if (openblock == false) {

        tokenizer._lastClosedBlock = tokenizer._blocks.pop()
        if (tokenizer._lastClosedBlock == "try") { forceEatCatch() }

        return tokenizer.getNextToken();
    }

    while (openblock) {
        token = scan.see(parser, token, tokenizer, "NestedBlockBody")

        if (tokenizer.isEOB()) {
            return
        }

        if (token == undefined) {
            console.log(parser.tokens)
            console.log(tokenizer._rows.length)
            console.log(tokenizer._rows)
            console.log("eatNestedBlockBody")
        }
        const kind  = token.kind
        const value = token.tokenValue

        if (value == "}") {
            tokenizer.eatCloseBlock(token, parser)
             // check must be on "body" closed
             // because this function is recursive!!!
            if (tokenizer._lastClosedBlock == "NestedBlockBody") { return; }
        }
        else if (kind == "NUMBER") {
            token = parser.NumericLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)

        }
        else if (kind == "STRING") {
            token = parser.StringLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)

        }
        else if (kind == "VARIABLEDECLARATION") {
            token = parser.VariableDeclaration(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)

        }
        else if (kind == "FUNCTIONCALL") {
            token = parser.FunctionCall(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)

        }
        else if (kind == "IF") {
            parser.tokenizer.branchController.openBranch();
            token = parser.ifCall(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)
            // addBodyToIFBlock(parser, token)
        }
        else if (kind == "ELSE") {
            token = parser.elseCall(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)
        }
        else if (value == "while") {
            eatWhile()
        }
        else if (value == "break") {
            eatBreak()
        }
        else if (value == "continue") {
            eatContinue()
        }
        else if (value == "for") {
            eatFor()
        }
        else if (kind == "RETURN") {
            token = parser.ReturnLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToNestedBlock(parser, token)
            // addBodyToIFBlock(parser, token)
            // eatReturn()
        }
        else if (value == "const") {
            eatConstOrLetStatement(true)
        }
        else if (value == "let") {
            eatConstOrLetStatement(false)
        }
        else if (value == "this") {
            eatCallOrAssign()
        }
        else if (value == "delete") {
            eatDelete()
        }
        else if (value == "throw") {
            eatThrow()
        }
        else if (value == "try") {
            eatTry()
        }
        else if (value == "catch") {
            // using forceEatCatch instead of eatCatch
            misplacedCatch()
        }
        else if (value == "finally") {
            eatFinally()
        }
        else if (kind == "name") {
            eatCallOrAssign()
        }
        else if (kind == ";") {
            eat()
        }
        else if (kind == "end-of-line") {
            eat()
        }
        else if (value == "function") {
            eat()
            eatInnerFunction()
        }
        else {
            errorHandler._unexpected(token, '', parser)
        }
    }
}

function addBodyToNestedBlock(parser, token){
    let parentBlock
// TODO add if, else and other bodies
    if (parser.tokenizer.branchController.getCurrentBranch() != '') {
        parentBlock = parser.tokens.filter(function (element) { return element.path == parser.tokenizer.branchController.getCurrentBranch()
            && (element.kind.includes('FunctionsBlock')
            ||element.kind.includes('ifCall')
            ||element.kind.includes('elseCall')); });

        for (let index = parentBlock.length - 1; index >= 0; index--) {

                parentBlock[index].body = parentBlock[index].body + JSON.stringify(token)
                break;

        }

    }

}

