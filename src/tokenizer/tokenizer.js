import { createToken, tokenToString } from '../types/tokens.js';
import { blocksSpec } from './specs.js';
import * as register from '../parser/register.js';
import * as functions from './functions.js'
import * as branchController from './branches.js'
import * as scan from './scan.js'
import { Parser } from '../parser/parser.js';

/**
 * Tokenizer class.
 *
 * Lazily pulls a token from a stream.
 */
export class Tokenizer {
    /**
     * Initializes the string
     */
    Init(string, parser){
        this._string = string;
        this._cursor = 0;
        this._rows = string.split('\n');
        this._currentRow = 0;
        this._currentCol = 0;
        this._parentParser = parser;
        this._blocks = [];
        this._lastClosedBlock = "";
        this.branchController = branchController;
    }

    /**
     *
     */
    _match(regexp, string){
        const matched = regexp.exec(string);

        if (matched == null){
            return null;
        }
        // this._currentRow = this.getLineWithCursor();
        // this._currentCol = this.getColumnWithCursor(String(matched[0].split('\n')[0]).length)
        this._cursor += matched[0].length;
        return { tokenValue: matched[0], tokenMatch: matched.groups, currentRow: this._currentRow, currentCol:this._currentCol }
    }

    eatEndOfFile() {
        const string = this._string.slice(this._cursor);
        this._currentRow = this.getLineWithCursor();
        this._currentCol = this.getColumnWithCursor(String(string).length);
        let token = this._parentParser.EndOfFile(createToken(this._currentRow, this._currentCol, "endOfFile", string));
        return token
    }
    /**
     * Wheter the tokenizer reached EOF.
     */
    isEOF(tokens){
        if (this._cursor === this._string.length) {
            tokens.push(this.eatEndOfFile());
            return true;
        }else{
            return false;
        }


    }

    isEOB(){
        if (this._cursor === this._string.length) {

            return true;
        }else{
            return false;
        }


    }

    /**
     * Whether we still have more tokens.
     */
    hasMoreTokens(){
        return this._cursor < this._string.length;
    }

    getLineWithCursor() {
        // Split the source code into lines
        const lines = this._rows;

        // Initialize variables to track cumulative character count and current line number
        let cumulativeChars = 0;
        let lineNumber = 0;

        // Iterate through each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineLength = line.length;

            // Calculate the cumulative character count for this line
            cumulativeChars += lineLength + 1; // Add 1 for the newline character

            // Check if the cursor position falls within this line
            if (cumulativeChars >= this._cursor) {
                // If the cursor position is within this line, return the line number and the line itself
                return lineNumber + 1;
            }

            // Increment the line number
            lineNumber++;
        }

        // If the cursor position is beyond the end of the source code, return the last line
        // return { lineNumber, line: lines[lines.length - 1] };
        return lineNumber;
    }

    getColumnWithCursor(offset) {
        // Initialize variables to track cumulative character count and current line number
        let cumulativeChars = 0;
        let columnNumber = 0;
        offset = offset -1;

        // Iterate through each line
        for (let i = 0; i < this._rows.length; i++) {
            const line = this._rows[i];
            const lineLength = line.length;

            // Calculate the cumulative character count for this line
            cumulativeChars += lineLength + 1; // Add 1 for the newline character

            // Check if the cursor position falls within this line
            if (cumulativeChars >= this._cursor) {
                // Calculate the column number by subtracting the cumulative character count from the cursor position
                columnNumber = this._cursor - (cumulativeChars - lineLength);
                // Return the column number
                return columnNumber - offset;
            }
        }

        // If the cursor position is beyond the end of the source code, return the last column
        // In this case, you might want to handle edge cases depending on your specific requirements
        return columnNumber - offset;
    }


    /**
     * Obtains next token.
     */
    getNextToken(){

        if (!this.hasMoreTokens()) {
            return null;
        }
        let save;
        const string = this._string.slice(this._cursor);

        for (const [tokenType, regexp] of blocksSpec) {
            const tokenResult = this._match(regexp, string);

            save = tokenResult;
            if (tokenResult == null) {
                continue;
            }

            if (tokenType == null) {
                return this.getNextToken();
            }

            if (tokenType == 'INCLUDESBLOCK' ||
                tokenType == 'VARIABLESBLOCK' ||
                tokenType == 'FUNCTIONSBLOCK') {
                this._currentRow = this.getLineWithCursor();
                this._currentCol = this.getColumnWithCursor(String(tokenResult.tokenValue.split('\n')[0]).length)
                return this.getBlockBody(tokenResult, tokenType, this._parentParser);
            }

            this._currentRow = this.getLineWithCursor();
            this._currentCol = this.getColumnWithCursor(String(tokenResult.tokenValue).length)
            return createToken(
                this._currentRow,
                this._currentCol,
                tokenType,
                tokenResult.tokenValue,
                tokenResult.tokenMatch);
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`);

    }

    getBlockBody(token, tokenType, parser){

        // if (isExporting) {
            // register.registerPublicFunction(eatName())// TODO
        // }
        // else {
        //     registerPrivateFunction(eatName())
        // }

        switch (tokenType) {
            case 'INCLUDESBLOCK':
                this.branchController.openBranch();
                parser.tokens.push(parser.IncludesBlock(token, this._parentParser) );
                functions.eatGlobalIncludes(branchController, parser, token, this)
                break;

            case 'VARIABLESBLOCK':
                this.branchController.openBranch();
                parser.tokens.push(parser.VariablesBlock(token, this._parentParser) );
                functions.eatGlobalVariables(branchController, parser, token, this)
                break;

            case 'FUNCTIONSBLOCK':
                functions.eatGlobalFunction(branchController, parser, token, this)
                break;

            default:
                break;
        }

    }

    eatOpenBlock(val, token) {
        this._blocks.push(val)

        // token.currentRow = this.getLineWithCursor();
        // token.currentCol = this.getColumnWithCursor(String(token.tokenValue.split('\n')[0]).length)
        scan.eatValue("{", this._parentParser, token)
    }

    eatCloseBlock(token, parser) {

        this.addToken(token, parser)
        // branchController.closeBranch()
        this._lastClosedBlock = this._blocks.pop()
        if (this._lastClosedBlock == "try") { forceEatCatch() }
    }

    addToken(token, parser){

        do {
            parser._offset++;
            switch (token.kind) {
                case 'SEMICOLON':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.SemicolonLiteral)

                    break;
                case 'NUMBER':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.NumericLiteral)

                    break;

                case 'STRING':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.StringLiteral)

                    break;
                case 'CLOSINGBLOCK':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.ClosingBlockLiteral)
                    // parser.tokens.push(parser.ClosingBlockLiteral(token, parser));
                    break;

                default:
                    throw new SyntaxError(`Literal: unexpected literal production`);

            }
        } while (this.isEOB() === false);
    }

}


