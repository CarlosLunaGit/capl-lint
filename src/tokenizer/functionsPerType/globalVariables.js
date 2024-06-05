import * as scan from "../scan.js"
import * as errorHandler from '../../parser/errors.js';

export function eatGlobalVariables(branchController, parser, token, tokenizer) {  // callable by module parser.js
    // name already registered by module parser.js
    // branchController.closedBranches = [ ] // erasing old values
    branchController.closedBranches.splice(0,branchController.closedBranches.length)
    eatVariablesCore(branchController, parser, token, tokenizer)
    // endGlobalFunction(branchController)
}

function eatVariablesCore(branchController, parser, token, tokenizer) {
    eatVariablesBody(tokenizer, parser, token)
}


function eatVariablesBody(tokenizer, parser, token) {

    let openblock = tokenizer.eatOpenBlock("VariblesBody", token, parser)
    if (openblock == false) {

        tokenizer._lastClosedBlock = tokenizer._blocks.pop()
        if (tokenizer._lastClosedBlock == "try") { forceEatCatch() }

        return tokenizer.getNextToken();
    }

    while (openblock) {
        token = scan.see(parser, token, tokenizer, "VariblesBody")

        if (tokenizer.isEOB()) {
            return
        }

        if (token == undefined) {
            console.log(parser.tokens)
            console.log(tokenizer._rows.length)
            console.log(tokenizer._rows)
            console.log("eatFunctionBody")
        }
        const kind  = token.kind
        const value = token.tokenValue

        if (value == "}") {
            tokenizer.eatCloseBlock(token, parser)
             // check must be on "body" closed
             // because this function is recursive!!!
            if (tokenizer._lastClosedBlock == "VariblesBody") { return }
        }
        else if (kind == "NUMBER") {
            token = parser.NumericLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToVariablesBlock(parser, token)

        }
        else if (kind == "STRING") {
            token = parser.StringLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToVariablesBlock(parser, token)

        }
        else if (kind == "VARIABLEDECLARATION") {
            token = parser.VariableDeclaration(token, parser)
            parser.tokens.push(token);
            addBodyToVariablesBlock(parser, token)

        }
        else if (value == "if") {
            eatIf()
        }
        else if (value == "else") {
            eatElse()
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
        else if (value == "return") {
            eatReturn()
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
        else if (kind == "endOfFile") {
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

function addBodyToVariablesBlock(parser, token){
    let parentBlock

    if (parser.tokenizer.branchController.getCurrentBranch() != '') {
        parentBlock = parser.tokens.filter(function (element) { return element.path == parser.tokenizer.branchController.getCurrentBranch()
            && element.kind.includes('VariablesBlock'); });

        if (parentBlock != null) {
            parentBlock[0].body = parentBlock[0].body + JSON.stringify(token)
        }

    }

}