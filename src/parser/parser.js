/**
 * Letter parser: recursive descent implementation
 */

import { Tokenizer } from '../tokenizer/tokenizer.js';
import * as errorHandler from './errors.js';
import * as register from './register.js';
import * as typesModule from '../types/types.js'


export class Parser {
    /**
     * Initializes the parser.
     */
    constructor() {
        this.sourceFile = '';
        this.tokenizer = new Tokenizer();
        this.tokens = [];
        this.errors = [];
        this._lookBehind;
        //
        this.imports = { } // fullpath: importObj
        this.exports = { } // fullname: token
        //
        this.declareds = { } // fullname: token // includes standard, import, export and constant
        this.useds = { } // fullname: token
        this._offset = 0;
    }

    /**
     * Parses a string into an AST
     */
    parse(string) {
        this.sourceFile = string;
        this.tokenizer.Init(string, this);

        // Prime the tokenizer to obtain the first
        // token which is our lookahead. The lookahead is
        // used for predictive parsing.

        this._lookahead = this.tokenizer.getNextToken();


        // Parse recursively starting from the main
        // entry point, the Program:
        this.Program();

        return this;
    }
    /**
     * Main entry point
     *
     * Program
     *  : Literal
     *  ;
     */
    Program() {
        return {
            kind: 'Program',
            body: this.Literal()
        };
    }

    pushToken(callback){

        let token = callback(this._lookBehind, this);

        this.tokens.push(token);
        this.tokenizer._cursor += String(token.statement).length;

        callback(false, this)

        if (this.tokens.includes(this._lookBehind)) {
            this.tokens.push(this._lookahead);
        }

    }

    /**
     * Literal
     *  : NumericLiteral
     *  : StringLiteral
     *  : VariableDeclaration
     */
    Literal() {

        do {
            switch (this._lookahead.kind) {
                case 'SEMICOLON':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.SemicolonLiteral)

                    break;

                case 'NUMBER':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.NumericLiteral)

                    break;

                case 'STRING':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.StringLiteral)

                    break;

                case 'INCLUDESBLOCK':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.IncludesBlock)

                    break;

                case 'VARIABLESBLOCK':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.VariablesBlock);
                    break;

                case 'FUNCTIONSBLOCK':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.FunctionsBlock);
                    break;

                case 'VARIABLEDECLARATION':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.VariableDeclaration);
                    break;

                case 'FUNCTIONCALL':
                    this._lookBehind = this._lookahead;
                    this.tokens.push(this.FunctionCall());
                    break;

                default:
                    throw new SyntaxError(`Literal: unexpected literal production`);

            }
        } while (this.tokenizer.isEOF(this.tokens) === false);

        return this.tokens
    }

    /**
     * StringLiteral
     *  : STRING
     *  ;
     */
    StringLiteral(token = false, parser) {
        if (token == false) {
            token = parser.read('STRING');
        }


        return {
            kind: 'StringLiteral',
            statement: token.value.slice(1, -1),
            row: token.row,
            col: token.col,
            path: parser.tokenizer.branchController.getCurrentBranch()
        };
    }

    /**
     * SemicolonLiteral
     *  : SEMICOLON
     *  ;
     */
    SemicolonLiteral(token = false, parser) {
        if (token == false) {
            token = parser.read('SEMICOLON');
        }


        return {
            kind: 'SemicolonLiteral',
            statement: token.value.slice(1, -1),
            row: token.row,
            col: token.col,
            path: parser.tokenizer.branchController.getCurrentBranch()
        };
    }

    /**
     * NumericLiteral
     *  : NUMBER
     *  ;
     */
    NumericLiteral(token = false, parser) {
        if (token == false) {
            token = parser.read('NUMBER');
        }


        return {
            kind: 'NumericLiteral',
            statement: Number(token.value),
            row: token.row,
            col: token.col,
            path: parser.tokenizer.branchController.getCurrentBranch()
        };
    }

    /**
     * VariableDeclaration
     *  : VARIABLEDECLARATION
     *  ;
     */
    VariableDeclaration(token = false, parser) {
        if (token == false) {
            token = parser.read('VARIABLEDECLARATION');
        }


        return {
            kind: 'VariableDeclaration',
            statement: token.value,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            modifier: token.matches.modifier || null,
            dataType: token.matches.dataType || null,
            name: token.matches.name || null,
            arraySize: token.matches.arraySize || null,
            assigment: token.matches.assigment || null,
            value: token.matches.value || null,
            semicolon: token.matches.semicolon || null,
            path: parser.tokenizer.branchController.getCurrentBranch()
        };
    }

    /**
     * FunctionCall
     *  : FUNCTIONCALL
     *  ;
     */
    FunctionCall(token = false, parser) {
        if (token == false) {
            token = parser.read('FUNCTIONCALL');
        }


        return {
            kind: 'FunctionCall',
            statement: token.value,
            row: token.row,
            col: token.col,
            name: token.matches.name || null,
            openParen: token.matches.openParen || null,
            arguments: token.matches.arguments || null,
            closeParen: token.matches.closeParen || null,
            semicolon: token.matches.semicolon || null,
            path: parser.tokenizer.branchController.getCurrentBranch()

        };
    }

    /**
     * IncludesBlock
     *  : INCLUDESBLOCK
     *  ;
     */
    IncludesBlock(token = false, parser) {
        if (token == false) {
            token = parser.read('INCLUDESBLOCK');
        }

        return {
            kind: 'IncludesBlock',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            name: token.tokenMatch.name || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: token.tokenMatch.body || '',
            closeCurly: token.tokenMatch.closeCurly || null,
            path: parser.tokenizer.branchController.getCurrentBranch()

        };
    }

    /**
     * IncludeStatement
     *  : INCLUDE
     *  ;
     */
    IncludeStatement(token = false, parser) {
        if (token == false) {
            token = parser.read('INCLUDE');
        }


        return {
            kind: 'IncludeStatement',
            statement: token.value,
            row: token.row,
            col: token.col,
            openKey: token.matches.openKey || null,
            keyword: token.matches.keyword || null,
            dir: token.matches.dir || null,
            semicolon: token.matches.semicolon || null,
            path: parser.tokenizer.branchController.getCurrentBranch()

        };
    }

    /**
     * VariablesBlock
     *  : VARIABLESBLOCK
     *  ;
     */
    VariablesBlock(token = false, parser) {
        if (token == false) {
            token = parser.read('VARIABLESBLOCK');
        }


        return {
            kind: 'VariablesBlock',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            name: token.tokenMatch.name || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: token.tokenMatch.body || '',
            closeCurly: token.tokenMatch.closeCurly || null,
            path: parser.tokenizer.branchController.getCurrentBranch()

        };
    }

    /**
     * FunctionsBlock
     *  : FUNCTIONSBLOCK
     *  ;
     */
    FunctionsBlock(token = false, parser) {
        if (token == false) {
            token = parser.read('FUNCTIONSBLOCK');
        }


        return {
            kind: 'FunctionsBlock',
            statement: token.value,
            row: token.row,
            col: token.col,
            dataType: token.matches.dataType || null,
            name: token.matches.name || null,
            openParen: token.matches.openParen || null,
            arguments: token.matches.arguments || null,
            closeParen: token.matches.closeParen || null,
            openCurly: token.matches.openCurly || null,
            path: parser.tokenizer.branchController.getCurrentBranch()

        };
    }

    /**
     * ClosingBlockLiteral
     *  : STRING
     *  ;
     */
    ClosingBlockLiteral(token = false, parser) {
        let parentBlock
        if (token == false) {
            token = parser.read('CLOSINGBLOCK');
        }

        if (parser.tokenizer.branchController.getCurrentBranch() != '') {
            parentBlock = parser.tokens.filter(function (element) { return element.path == parser.tokenizer.branchController.getCurrentBranch()
                && (element.kind.includes('IncludesBlock')||element.kind.includes('VariablesBlock')); });

            if (parentBlock != null) {
                parentBlock[0].closeCurly = token.value
            }
        }

        let localBranch = parser.tokenizer.branchController.getCurrentBranch();
        parser.tokenizer.branchController.closeBranch()

        return {
            kind: 'ClosingBlockLiteral',
            statement: token.value,
            row: token.row,
            col: token.col,
            path: localBranch
        };
    }

    /**
     * EndOfFile
     *  : endOfFile
     *  ;
     */
    EndOfFile(token) {

        return {
            kind: 'endOfFile',
            statement: token.value,
            row: token.row,
            col: token.col,
            path: 'endOfFile'

        };
    }


    // case 'FUNCTIONCALL':
    //                 this.tokens.push(this.FunctionCall());

    read(tokenType) {
        const token = this._lookahead;

        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"`,
            );
        }

        if (token.kind !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`,
            );
        }

        // Advance to next token.
        this._lookahead = this.tokenizer.getNextToken();

        return token;
    }

    see() {  // does not modify tokens
        return this.tokens[0]
    }

    eatImports() {
        while (see().value == "import") { eatImport() }
    }

    mainLoop() {
        while (this.tokens.length > 0) {
            const token = this.eat();
            if (token.path == "")  { this.eatOutOfScope(token, this); continue }
            if (token.kind == "IncludesBlock")  { this.eatIncludesBlock(token, this); continue }
            if (token.kind == "IncludeStatement")  { this.eatIncludeStatement(token, this); continue }
            if (token.kind == "VariablesBlock")  { this.eatVariablesBlock(token, this); continue }


            //TODO
            if (token.kind == "StringLiteral")  { this.eatKind(token, this); continue }
            if (token.kind == "NumericLiteral")  { this.eatKind(token, this); continue }

            if (token.kind == "VariableDeclaration")    { this.eatGlobal(token, false, false, this); continue }

            if (token.kind == "FunctionCall")    { this.eatFunctionCall(token, false, false, this); continue }
            //TODO
            if (token.kind == "ClosingBlockLiteral")  { this.eatClossingLiteral(token, this); continue }


            if (token.kind == "endOfFile") { return }
            errorHandler.unexpected(token, '', this)
        }
    }

    eat() {
        return this.tokens.shift()
    }

    // eatName() {
    //     const token = this.tokens.shift()
    //     if (token.kind != "name") { errorHandler.expecting(token, "name") } // linter exits
    //     return token
    // }

    eatGlobal(token, isExporting, isConstant, parser) {
        // token = this.eatName()
        // if (isExporting) {
            register.registerPublicVariable(token, isConstant, this)

            let missingSemicolon = token.semicolon === null;
            if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }
        // }
        // else {
        //     register.registerPrivateVariable(token, isConstant)
        // }

        // token = this.eat()
        // if (token.kind == "endOfFile") { return }

        // if (token.value != "=") { errorHandler.unexpected(token '', parser) }
        // eatLiteralExpression()

    }

    eatKind(token, parser) {
        // const token = rat.tokens.shift()
        let acceptedKind = typesModule.kinds.includes(token.kind);
        if ( acceptedKind === false) { errorHandler.invalidStatement(token, '', parser) }

        let missingSemicolon = token.semicolon === null;
        if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

    }

    eatIncludeStatement(token, parser) {

        let openKey = token.openKey === null;
        let keyword = token.keyword === null;
        let dir = token.dir === null;
        let semicolon = token.semicolon === ';';

        if ( openKey === true) { errorHandler.expecting(token, '"#"', parser) }
        if ( keyword === true) { errorHandler.expecting(token, 'include', parser) }
        if ( dir === true) { errorHandler.expecting(token, '"valid File path"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }

    }

    eatIncludesBlock(token, parser) {

        let openCurly = token.openCurly === null;
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }

    }

    eatVariablesBlock(token, parser) {

        let openCurly = token.openCurly === null;
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }

    }


    eatClossingLiteral(token, parser) {

        let path = token.path === null;

        if ( path === true) { errorHandler.unexpected(token, '}', parser) }

    }

    eatFunctionCall(token, isExporting, isConstant, parser) {

            // register.registerPublicVariable(token, isConstant, this)

            let missingSemicolon = token.semicolon === null;
            if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }


    }

    eatFunction(isExporting) {
        if (isExporting) {
            registerPublicFunction(eatName())
        }
        // else {
        //     registerPrivateFunction(eatName())
        // }
        eatGlobalFunction() // calls function in function.js
        // eatTrueEndOfLine()
    }


    eatOutOfScope(token, parser) {

        errorHandler.unexpectedScope(token, parser)

    }

}
