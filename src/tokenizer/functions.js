import * as scan from "./scan.js"
import * as errorHandler from '../parser/errors.js';

export function eatGlobalFunction(branchController, parser, token) {  // callable by module parser.js
    // name already registered by module parser.js
    // branchController.closedBranches = [ ] // erasing old values
    branchController.closedBranches.splice(0,branchController.closedBranches.length)
    eatFunctionCore(branchController, parser, token)
    endGlobalFunction(branchController)
}

export function eatAnonymousFunction() { // callable by module expression.js
    registerAnonymousFunction() // no token needed
    eatFunctionCore()
}

function eatInnerFunction() { // private
    registerInnerFunction(eatName())
    eatFunctionCore()
}


// common part for the 3 kind of functions:

function eatFunctionCore(branchController, parser, token) {
    branchController.openBranch() // for control of scope of names
    eatFunctionParams(parser, token)
    eatFunctionBody()
}

function eatFunctionParams(parser, token) {
    scan.eatValue("(", parser, token)
    if (scan.see(parser, token).value == ")") { eat(); return }
    while (true) {
        let token = eatName()
        registerParameter(token)
        token = eat()
        if (token.value == ")") { return }
        if (token.value != ",") { errorHandler.unexpected(token, '', parser) }
    }
}

function eatFunctionBody() {
    eatOpenBlock("body")
    //
    while (true) {
        const token = scan.see()
        const kind  = token.kind
        const value = token.value

        if (value == "}") {
            eatCloseBlock()
             // check must be on "body" closed
             // because this function is recursive!!!
            if (lastClosedBlock == "body") { return }
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
        else if (kind == "end-of-line") {
            eat()
        }
        else if (value == "function") {
            eat()
            eatInnerFunction()
        }
        else {
            errorHandler.unexpected(token, '', parser)
        }
    }
}

function eatReturn() {
    eat()  // eats 'return'
    const kind = scan.see().kind  // not eating just seeing
    if (kind == "}"  ||  kind == ";"  ||  kind == "end-of-line") { return }
    eatExpression()
    seeEndOfBlockOrTrueEndOfLine()  // not eating just checking
}

function eatIf() {
    eat()  // eats 'if'
    scan.eatValue("(", parser, token)
    eatExpression()
    scan.eatValue(")", parser, token)
    eatOpenBlock("if")  // for block control
    openBranch()   // for name scope control
}

function eatElse() {
    const token = eat()  // eats 'else'

    // controlling blocks
    if (lastClosedBlock != "if") { err(token, "'else' does not match 'if'") }

    if (scan.see().value == "if") { return } // aborting 'else' block;
                                        // router will se the 'if' token
                                        // and call eatIf that will create
                                        // an 'if' block;
                                        // this behaviour is very counterintuitive at
                                        // first sight but is necessary and works fine!

    eatOpenBlock("else")  // for block control
    openBranch()   // for name scope control
}


export function eatGlobalIncludes(branchController, parser, token, tokenizer) {  // callable by module parser.js
    // name already registered by module parser.js
    // branchController.closedBranches = [ ] // erasing old values
    branchController.closedBranches.splice(0,branchController.closedBranches.length)
    eatIncludesCore(branchController, parser, token, tokenizer)
    // endGlobalFunction(branchController)
}

function eatIncludesCore(branchController, parser, token, tokenizer) {
    // let branch;
    // branch = branchController.openBranch() // for control of scope of names
    // eatFunctionParams(parser, token)
    eatIncludesBody(tokenizer, parser, token)

    // token.branch = branch
}

function addBodyToIncludesBlock(parser, token){
    let parentBlock

    if (parser.tokenizer.branchController.getCurrentBranch() != '') {
        parentBlock = parser.tokens.filter(function (element) { return element.path == parser.tokenizer.branchController.getCurrentBranch()
            && element.kind.includes('IncludesBlock'); });

        if (parentBlock != null) {
            parentBlock[0].body = parentBlock[0].body + JSON.stringify(token)
        }

    }

}

function eatIncludesBody(tokenizer, parser, token) {

    tokenizer.eatOpenBlock("IncludesBody", token, parser)

    while (true) {
        token = scan.see(parser, token, tokenizer, "IncludesBody")

        if (tokenizer.isEOB()) {
            return
        }
        const kind  = token.kind
        const value = token.value

        if (value == "}") {
            tokenizer.eatCloseBlock(token, parser)
             // check must be on "body" closed
             // because this function is recursive!!!
            if (tokenizer._lastClosedBlock == "IncludesBody") { return }
        }
        else if (kind == "NUMBER") {
            token = parser.NumericLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToIncludesBlock(parser, token)

        }
        else if (kind == "STRING") {
            token = parser.StringLiteral(token, parser)
            parser.tokens.push(token);
            addBodyToIncludesBlock(parser, token)

        }
        else if (kind == "INCLUDE") {
            token = parser.IncludeStatement(token, parser)
            parser.tokens.push(token);
            addBodyToIncludesBlock(parser, token)

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
            errorHandler.unexpected(token, '', parser)
        }


    }
}

// Variables Block

export function eatGlobalVariables(branchController, parser, token, tokenizer) {  // callable by module parser.js
    // name already registered by module parser.js
    // branchController.closedBranches = [ ] // erasing old values
    branchController.closedBranches.splice(0,branchController.closedBranches.length)
    eatVariablesCore(branchController, parser, token, tokenizer)
    // endGlobalFunction(branchController)
}

function eatVariablesCore(branchController, parser, token, tokenizer) {
    // let branch;
    // branch = branchController.openBranch() // for control of scope of names
    // eatFunctionParams(parser, token)
    eatVariablesBody(tokenizer, parser, token)

    // token.branch = branch
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

function eatVariablesBody(tokenizer, parser, token) {

    tokenizer.eatOpenBlock("VariblesBody", token, parser)

    while (true) {
        token = scan.see(parser, token, tokenizer, "VariblesBody")

        if (tokenizer.isEOB()) {
            return
        }
        const kind  = token.kind
        const value = token.value

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
            errorHandler.unexpected(token, '', parser)
        }


    }
}