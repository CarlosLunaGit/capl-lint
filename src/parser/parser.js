/**
 * Letter parser: recursive descent implementation
 */

import { Tokenizer } from '../tokenizer/tokenizer.js';
import * as errorHandler from './errors.js';
import * as register from './register.js';
import * as typesModule from '../types/types.js';
import * as scan from '../tokenizer/scan.js';
import { addToBlockProperty } from '../tokenizer/functionsPerType/globalFunctions.js';
import { createToken } from '../types/tokens.js';


export class Parser {
    /**
     * Initializes the parser.
     */
    constructor() {
        this.sourceFile = '';
        this.normalizedSourceFile = '';
        this.tokenizer = new Tokenizer();
        this.tokens = [];
        this.errors = [];
        this.sysErrors = [];
        this._lookBehind;
        //
        this.imports = { } // fullpath: importObj
        this.exports = { } // fullname: token
        //
        this.declareds = { } // fullname: token // includes standard, import, export and constant
        this.includes = { } // Include block and their includes statements
        this.useds = { } // fullname: token
        this._offset = 0;

    }

    /**
     * Parses a string into an AST
     */
    parse(string) {
        this.sourceFile = string;
        this.normalizedSourceFile = string.replace(/\\r\\n/g, '\n').replace(/\\\"/g, '"');
        this.tokenizer.Init(this.normalizedSourceFile, this);


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

    pushToken(token){

        // let token = callback(this._lookBehind, this);

        this.tokens.push(token);

        if (this.tokenizer.BlockWithoutBrackets === true && (token.kind != 'ifCall' && token.kind != 'elseCall' && token.kind != 'elseIfCall')) {
            this.tokenizer.branchController.closeBranch();
            this.tokenizer.BlockWithoutBrackets = false;
        }
        // this.tokenizer._cursor += String(token.statement).length;

        // callback(false, this)

        // if (this.tokens.includes(this._lookBehind)) {
        //     this.tokens.push(this._lookahead);
        // }

    }

    /**
     * Literal
     *  : NumericLiteral
     *  : StringLiteral
     *  : VariableDeclaration
     */
    Literal() {
        console.log(this._lookahead);

        if (this._lookahead == undefined) {
            return this.tokens;
        }

        do {
            switch (this._lookahead.kind) {
                case 'SEMICOLON':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.SemicolonLiteral(this._lookBehind));
                    break;

                case 'NUMBER':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.NumericLiteral(this._lookBehind));
                    break;

                case 'STRING':
                    this._lookBehind = this._lookahead;
                    this.pushToken(this.StringLiteral(this._lookBehind));
                    break;

                case 'INCLUDESBLOCK':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.IncludesBlock(this._lookBehind));
                    break;

                case 'INCLUDE':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.IncludeStatement(this._lookBehind));
                    break;

                case 'VARIABLESBLOCK':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.VariablesBlock(this._lookBehind));
                    break;

                case 'VARIABLEDECLARATION':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.VariableDeclaration(this._lookBehind));
                    break;

                case 'VARIABLEDECLARATION_STRUCT':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.VariableDeclarationStruct(this._lookBehind));
                    break;

                case 'FUNCTIONSBLOCK':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.FunctionsBlock(this._lookBehind));
                    break;

                case 'INITIALIZATIONSTATEMENT':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.InitializationStatement(this._lookBehind));
                    break;

                case 'FUNCTIONCALL':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.FunctionCall(this._lookBehind));
                    break;

                case 'IF':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();

                    if (this._lookBehind.tokenMatch.openCurly) {
                        this.pushToken(this.ifCall(this._lookBehind));
                    } else {
                        this.tokenizer.BlockWithoutBrackets = true;
                        this.pushToken(this.ifCall(this._lookBehind));
                    }
                    break;

                case 'ELSE':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.elseCall(this._lookBehind));
                    break;

                case 'ELSEIF':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.elseIfCall(this._lookBehind));
                    break;

                case 'FORLOOP':
                    this._lookBehind = this._lookahead;
                    this.tokenizer.branchController.openBranch();
                    this.pushToken(this.forLoopCall(this._lookBehind));
                    break;

                case 'RETURN':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body')
                    this.pushToken(this.ReturnStatement(this._lookBehind));
                    break;

                case 'SYSVARINITIALIZATION':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'body');
                    this.pushToken(this.SysvarInitializationStatement(this._lookBehind));
                    break;

                case 'CLOSINGBLOCK':
                    this._lookBehind = this._lookahead;
                    addToBlockProperty(this, this._lookBehind, 'closeCurly');
                    this.pushToken(this.ClosingBlockLiteral(this._lookBehind));
                    break;

                case 'UNMATCHED':
                    console.error(`Unmatched token encountered: ${this._lookahead.tokenValue}`);
                    break;

                default:
                    this._lookahead.definedInLiterals = "UNHANDLED";
                    errorHandler._unexpected(this._lookahead, this);
            }

            // Fetch the next token AFTER processing the current one
            this._lookahead = this.tokenizer.getNextToken(this._context);

            console.log("Next token: ", this._lookahead);

        } while (this._lookahead && !this.tokenizer.isEOF());

        // Check if the last token is a curly bracket and process it
        if (this._lookahead && this._lookahead.kind === 'CLOSINGBLOCK') {
            addToBlockProperty(this, this._lookahead, 'closeCurly');
            this.pushToken(this.ClosingBlockLiteral(this._lookahead));
        }

        this.pushToken(this.tokenizer.eatEndOfFile());

        // TODO: Record the tokens in a JSON file here
        return this.tokens;
    }


    /**
     * StringLiteral
     *  : STRING
     *  ;
     */
    StringLiteral(token) {

        return {
            kind: 'StringLiteral',
            statement: token.tokenValue.slice(1, -1),
            row: token.row,
            col: token.col,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * SemicolonLiteral
     *  : SEMICOLON
     *  ;
     */
    SemicolonLiteral(token) {

        return {
            kind: 'SemicolonLiteral',
            statement: token.tokenValue.slice(1, -1),
            row: token.row,
            col: token.col,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * NumericLiteral
     *  : NUMBER
     *  ;
     */
    NumericLiteral(token) {

        return {
            kind: 'NumericLiteral',
            statement: Number(token.tokenValue),
            row: token.row,
            col: token.col,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }



    /**
     * VariableDeclaration
     *  : VARIABLEDECLARATION
     *  ;
     */
    VariableDeclaration(token) {

        return {
            kind: 'VariableDeclaration',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            modifier: token.tokenMatch.modifier || null,
            dataType: token.tokenMatch.dataType || null,
            name: token.tokenMatch.name || null,
            arraySize: token.tokenMatch.arraySize || null,
            assigment: token.tokenMatch.assigment || null,
            value: token.tokenMatch.value || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * VariableDeclarationStruct
     *  : VARIABLEDECLARATION_STRUCT
     *  ;
     */
    VariableDeclarationStruct(token) {

        return {
            kind: 'VariableDeclarationStruct',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            structKeyword: token.tokenMatch.structKeyword || null,
            dataType: token.tokenMatch.dataType || null,
            name: token.tokenMatch.name || null,
            arrayStart: token.tokenMatch.arrayStart || null,
            arraySize: token.tokenMatch.arraySize || null,
            arrayEnd: token.tokenMatch.arrayEnd || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * InitializationStatement
     *  : INITIALIZATIONSTATEMENT
     *  ;
     */
    InitializationStatement(token) {

        return {
            kind: 'InitializationStatement',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            variable: token.tokenMatch.variable || null,
            equals: token.tokenMatch.equals || null,
            value: token.tokenMatch.value || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * SysvarInitializationStatement
     *  : SYSVARINITIALIZATION
     *  ;
     */
    SysvarInitializationStatement(token) {

        return {
            kind: 'SysvarInitializationStatement',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            prefix: token.tokenMatch.prefix || null,
            sysvarKey: token.tokenMatch.sysvarKey || null,
            namespace: token.tokenMatch.namespace || null,
            name: token.tokenMatch.name || null,
            assignment: token.tokenMatch.assignment || null,
            value: token.tokenMatch.value || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * FunctionCall
     *  : FUNCTIONCALL
     *  ;
     */
    FunctionCall(token) {

        return {
            kind: 'FunctionCall',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            name: token.tokenMatch.name || null,
            openParen: token.tokenMatch.openParen || null,
            arguments: token.tokenMatch.arguments || null,
            closeParen: token.tokenMatch.closeParen || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * ifCall
     *  : IF
     *  ;
     */
    ifCall(token) {

        return {
            kind: 'ifCall',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            ifkey: token.tokenMatch.ifkey || null,
            openParen: token.tokenMatch.openParen || null,
            conditional: token.tokenMatch.conditional || null,
            closeParen: token.tokenMatch.closeParen || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: '',
            closeCurly: null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * elseCall
     *  : ELSE
     *  ;
     */
    elseCall(token) {

        return {
            kind: 'elseCall',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            elsekey: token.tokenMatch.elsekey || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: '',
            closeCurly: null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * elseIfCall
     *  : ELSEIF
     *  ;
     */
    elseIfCall(token) {

        return {
            kind: 'elseIfCall',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            elseifkey: token.tokenMatch.elseifkey || null,
            openParen: token.tokenMatch.openParen || null,
            conditional: token.tokenMatch.conditional || null,
            closeParen: token.tokenMatch.closeParen || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: '',
            closeCurly: null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * forLoopCall
     * : FORLOOP
     * ;
     * */
    forLoopCall(token) {

        return {
            kind: 'forLoopCall',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            forKey: token.tokenMatch.forkey || null,
            openParen: token.tokenMatch.openParen || null,
            initializer: token.tokenMatch.initializer || null,
            closeParen: token.tokenMatch.closeParen || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: '',
            closeCurly: null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0
        };
    }

    /**
     * IncludesBlock
     *  : INCLUDESBLOCK
     *  ;
     */
    IncludesBlock(token) {

        return {
            kind: 'IncludesBlock',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            name: token.tokenMatch.name || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: token.tokenMatch.body || '',
            closeCurly: token.tokenMatch.closeCurly || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * IncludeStatement
     *  : INCLUDE
     *  ;
     */
    IncludeStatement(token) {

        return {
            kind: 'IncludeStatement',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            openKey: token.tokenMatch.openKey || null,
            keyword: token.tokenMatch.keyword || null,
            dir: token.tokenMatch.dir || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * VariablesBlock
     *  : VARIABLESBLOCK
     *  ;
     */
    VariablesBlock(token) {

        return {
            kind: 'VariablesBlock',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            name: token.tokenMatch.name || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: token.tokenMatch.body || '',
            closeCurly: token.tokenMatch.closeCurly || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * FunctionsBlock
     *  : FUNCTIONSBLOCK
     *  ;
     */
    FunctionsBlock(token) {

        return {
            kind: 'FunctionsBlock',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            dataType: token.tokenMatch.dataType || null,
            name: token.tokenMatch.name || null,
            openParen: token.tokenMatch.openParen || null,
            arguments: token.tokenMatch.arguments || null,
            closeParen: token.tokenMatch.closeParen || null,
            openCurly: token.tokenMatch.openCurly || null,
            body: token.tokenMatch.body || '',
            closeCurly: token.tokenMatch.closeCurly || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            closedBlock: null,
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * ReturnStatement
     *  : RETURN
     *  ;
     */
    ReturnStatement(token) {

        return {
            kind: 'ReturnStatement',
            statement: token.tokenValue,
            row: this.tokenizer._currentRow,
            col: this.tokenizer._currentCol,
            returnStatement: token.tokenMatch.returnStatement || null,
            semicolon: token.tokenMatch.semicolon || null,
            path: this.tokenizer.branchController.getCurrentBranch(),
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    /**
     * ClosingBlockLiteral
     *  : CLOSINGBLOCK
     *  ;
     */
    ClosingBlockLiteral(token) {

        let localBranch = this.tokenizer.branchController.getCurrentBranch();
        this.tokenizer.branchController.closeBranch()

        return {
            kind: 'ClosingBlockLiteral',
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            path: localBranch,
            parentBlockIndentation: token.parentBlockIndentation || 0
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
            statement: token.tokenValue,
            row: token.row,
            col: token.col,
            path: 'endOfFile',
            parentBlockIndentation: token.parentBlockIndentation || 0

        };
    }

    read(tokenType) {
        const token = this._lookahead;

        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"`,
            );
        }

        if (token.kind !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.tokenValue}", expected: "${tokenType}"`,
            );
        }

        // Advance to next token.
        this._lookahead = this.tokenizer.getNextToken();

        return token;
    }

    // see() {  // does not modify tokens
    //     return this.tokens[0]
    // }

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
            if (token.kind == "FunctionsBlock")  { this.eatFunctionsBlock(token, this); continue }
            if (token.kind == "ifCall")  { this.eatIfCallBlock(token, this); continue }
            if (token.kind == "elseCall")  { this.eatElseCallBlock(token, this); continue }
            if (token.kind == "elseIfCall")  { this.eatElseIfCallBlock(token, this); continue }
            if (token.kind == "forLoopCall")  { this.eatForLoopBlock(token, this); continue }

            //TODO
            if (token.kind == "StringLiteral")  { this.eatKind(token, this); continue }
            if (token.kind == "NumericLiteral")  { this.eatKind(token, this); continue }

            //TODO
            if (token.kind == "SysvarInitializationStatement") { this.eatSysvarInitializationStatement(token, this); continue }
            if (token.kind == "VariableDeclaration")    { this.eatVariableDeclaration(token, false, false, this); continue }
            if (token.kind == "VariableDeclarationStruct")    { this.eatVariableDeclarationStruct(token, false, false, this); continue }
            if (token.kind == "InitializationStatement")    { this.eatInitializationStatement(token, false, false, this); continue }
            if (token.kind == "FunctionCall")    { this.eatFunctionCall(token, false, false, this); continue }
            if (token.kind == "ReturnStatement")  { this.eatReturnStatement(token, this); continue }
            if (token.kind == "ClosingBlockLiteral")  { this.eatClossingLiteral(token, this); continue }
            if (token.kind == "endOfFile") { return }
            errorHandler.unexpected(token, '', this)
        }
    }

    eat() {
        return this.tokens.shift()
    }

    eatVariableDeclaration(token, isExporting, isConstant, parser) {

            register.registerPublicVariable(token, isConstant, this)

            let missingSemicolon = token.semicolon === null;
            if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

    }

    eatVariableDeclarationStruct(token, isExporting, isConstant, parser) {

        register.registerPublicVariable(token, isConstant, this)

        let missingSemicolon = token.semicolon === null;
        if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

}

    eatInitializationStatement(token, isExporting, isConstant, parser) {

        // register.registerPublicVariable(token, isConstant, this)
        let variable = token.variable === null;
        let equals = token.equals === null;
        let value = token.value === null;
        let missingSemicolon = token.semicolon === null;

        if ( variable === true) { errorHandler.expecting(token, 'variable', parser) }
        if ( equals === true) { errorHandler.expecting(token, '=', parser) }
        if ( value === true) { errorHandler.expecting(token, 'value', parser) }
        if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

    }

    eatSysvarInitializationStatement(token, isExporting, isConstant, parser) {

        // register.registerPublicVariable(token, isConstant, this)
        let sysvarKey = token.sysvarKey === null;
        let namespace = token.namespace === null;
        let name = token.name === null;
        let assignment = token.assignment === null;
        let value = token.value === null;
        let missingSemicolon = token.semicolon === null;

        if ( sysvarKey === true) { errorHandler.expecting(token, 'sysvarKey', parser) }
        if ( namespace === true) { errorHandler.expecting(token, 'namespace', parser) }
        if ( name === true) { errorHandler.expecting(token, 'name', parser) }
        if ( assignment === true) { errorHandler.expecting(token, '=', parser) }
        if ( value === true) { errorHandler.expecting(token, 'value', parser) }
        if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

    }

    eatKind(token, parser) {
        // const token = rat.tokens.shift()
        let acceptedKind = typesModule.kinds.includes(token.kind);
        if ( acceptedKind === false) { errorHandler.invalidStatement(token, '', parser) }

        let missingSemicolon = token.semicolon === null;
        if ( missingSemicolon === true) { errorHandler.expecting(token, ';', parser) }

    }

    eatIncludeStatement(token, parser) {

        register.registerIncludesBlock(token, this);

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

        register.registerIncludesBlock(token, this);

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

    eatFunctionsBlock(token, parser) {

        let dataType = token.dataType === null;
        let name = token.name === null;
        let openParen = token.openParen === null;

        let closeParen = token.closeParen === null;
        let openCurly = token.openCurly === null;
        let body = token.body === '';
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if ( dataType === true) { errorHandler.expecting(token, 'data type', parser) }
        if ( name === true) { errorHandler.expecting(token, 'function name', parser) }
        if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }

        if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused Function block', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }

    }

    eatIfCallBlock(token, parser) {

        let openParen = token.openParen === null;
        let conditional = token.conditional === null;
        let closeParen = token.closeParen === null;
        let openCurly = token.openCurly === null;
        let body = token.body === '';
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if (token.closedBlock === true) {
            if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }
            if ( conditional === true) { errorHandler.expecting(token, '"(condition)"', parser) }
            if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
            if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
            if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused IF block', parser) }
            if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
            if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }
        }
        else {
            if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }
            if ( conditional === true) { errorHandler.expecting(token, '"(condition)"', parser) }
            if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
            // if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
            if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused IF block', parser) }
            // if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
            if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }
        }



    }

    eatElseCallBlock(token, parser) {


        let openCurly = token.openCurly === null;
        let body = token.body === '';
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused ELSE block', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }


    }

    eatElseIfCallBlock(token, parser) {

        let openParen = token.openParen === null;
        let conditional = token.conditional === null;
        let closeParen = token.closeParen === null;
        let openCurly = token.openCurly === null;
        let body = token.body === '';
        let closeCurly = token.closeCurly === null;
        let semicolon = token.semicolon === ';';

        if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }
        if ( conditional === true) { errorHandler.expecting(token, '"(condition)"', parser) }
        if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused ELSE IF block', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }
        if ( semicolon === true) { errorHandler.unexpected(token, ';', parser) }


    }

    eatForLoopBlock(token, parser) {

        let forKey = token.forKey === null;
        let openParen = token.openParen === null;
        let initializer = token.initializer === null;
        let closeParen = token.closeParen === null;
        let openCurly = token.openCurly === null;
        let body = token.body === '';
        let closeCurly = token.closeCurly === null;

        if ( forKey === true) { errorHandler.expecting(token, 'for', parser) }
        if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }
        if ( initializer === true) { errorHandler.expecting(token, 'initializer', parser) }
        if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
        if ( openCurly === true) { errorHandler.expecting(token, '"{"', parser) }
        // if ( body === true) { errorHandler.unexpected(token, 'Empty/Unused FOR block', parser) }
        if ( closeCurly === true) { errorHandler.expecting(token, '"}"', parser) }

    }

    eatReturnStatement(token, parser) {

            let returnStatement = token.returnStatement === null;
            let semicolon = token.semicolon === null;

            if ( returnStatement === true) { errorHandler.expecting(token, 'return statement', parser) }
            if ( semicolon === true) { errorHandler.expecting(token, ';', parser) }

        }


    eatClossingLiteral(token, parser) {

        let path = token.path === null;

        if ( path === true) { errorHandler.unexpected(token, '}', parser) }

    }

    eatFunctionCall(token, isExporting, isConstant, parser) {

        let name = token.name === null;
        let openParen = token.openParen === null;
        let argumentsMissing = token.arguments === null;
        let closeParen = token.closeParen === null;
        let semicolon = token.semicolon === null;

        if ( name === true) { errorHandler.expecting(token, 'function name', parser) }
        if ( openParen === true) { errorHandler.expecting(token, '"("', parser) }
        // TODO Handle arguments on a secondary function
        // if ( argumentsMissing === true) { errorHandler.expecting(token, 'Arguments missing', parser) }
        if ( closeParen === true) { errorHandler.expecting(token, '")"', parser) }
        if ( semicolon === true) { errorHandler.expecting(token, ';', parser) }

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
