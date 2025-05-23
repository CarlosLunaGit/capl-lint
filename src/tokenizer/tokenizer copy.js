import { createToken, tokenToString } from '../types/tokens.js';
import { datatypes } from './specs/datatypes.js';
import { keywords } from './specs/keywords.js';
import { operators } from './specs/operators.js';
// import { blocksSpec } from './specs.js';
import * as register from '../parser/register.js';
import * as functions from './functionsMaster.js'
import * as branchController from './branches.js'
import * as scan from './scan.js'
import * as errorHandler from '../parser/errors.js';
import { token } from 'morgan';

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

        this._context = null;
        this.BlockWithoutBrackets = false;
        this.branchController.restartBranches();
        this.restartInit();
    }

    restartInit(){
        this.BlockWithoutBrackets = false;
    }

    /**
     *
     */
    _match(regexp, string, tokenType){

        const matched = regexp.exec(string);

        if (matched == null){
            return null;
        }

        if (tokenType == 'VARIABLEDECLARATION_MULTIPLE') {
            if (matched[0].includes("{") == true && matched[0].includes("}") == false) {
                return null;
            }

        }

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
    isEOF(){
        if (this._cursor === this._string.length) {
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

    getLineWithCursor(offset = 0) {
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
            if (cumulativeChars >= this._cursor - offset) {
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

    getColumnWithCursor(offset = 0, keyword = "") {
        // Initialize variables to track cumulative character count and current line number
        let cumulativeChars = 0;
        let columnNumber = 0;


        // Iterate through each line
        for (let i = 0; i < this._rows.length; i++) {
            const line = this._rows[i];
            const lineLength = line.length;

            // Calculate the cumulative character count for this line
            cumulativeChars += lineLength + 1; // Add 1 for the newline character

            // Check if the cursor position falls within this line
            if (keyword != "" ) {


                if (cumulativeChars >= (this._cursor - offset) && line.includes(keyword)) {
                    // Calculate the column number by subtracting the cumulative character count from the cursor position
                    columnNumber = this._cursor - (cumulativeChars - lineLength - 1);
                    // Return the column number
                    return line.indexOf(keyword);
                    // return columnNumber - offset;
                }

            } else {
                if (cumulativeChars >= this._cursor) {
                    // Calculate the column number by subtracting the cumulative character count from the cursor position
                    columnNumber = this._cursor - (cumulativeChars - lineLength - 1);
                    // Return the column number
                    return columnNumber - offset;
                }
            }

        }

        // If the cursor position is beyond the end of the source code, return the last column
        // In this case, you might want to handle edge cases depending on your specific requirements
        return columnNumber - offset;
    }


    /**
     * Obtains next token.
     */
    getNextToken(context = null) {
        if (!this.hasMoreTokens()) {
            return null;
        }
        let save;
        let currentRowChange;
        const string = this._string.slice(this._cursor);

        currentRowChange = this._currentRow;

        for (const [tokenType, regexp] of blocksSpec) {
            const tokenResult = this._match(regexp, string, tokenType);



            save = tokenResult;

            if (tokenResult == null) {
                continue;
            }

            if (tokenType == null) {
                return this.getNextToken(context);
            }



            if (context) {
                // Apply context-specific rules
                if (context === 'INCLUDESBLOCK' && tokenType === 'CLOSINGBLOCK') {
                    this._context = null;
                    currentRowChange = this._currentRow;
                    return createToken(this._currentRow, this._currentCol, tokenType, tokenResult.tokenValue, tokenResult.tokenMatch);
                }
                // Additional context-specific logic here...
            }

            if (tokenType == 'INCLUDESBLOCK' ||
                tokenType == 'VARIABLESBLOCK' ||
                tokenType == 'FUNCTIONSBLOCK' ||
                tokenType == 'TIMEREVENTBLOCK') {
                this._currentRow = this.getLineWithCursor(String(tokenResult.tokenValue).length);
                this._currentCol = this.getColumnWithCursor(String(tokenResult.tokenValue).length, String(tokenResult.tokenValue).split('\n')[0]);
                this._context = tokenType;  // Set the context for nested tokens

                return createToken(this._currentRow, this._currentCol, tokenType, tokenResult.tokenValue, tokenResult.tokenMatch);

            }

            // this._currentRow = this.getLineWithCursor();
            // this._currentCol = this.getColumnWithCursor(String(tokenResult.tokenValue).length);
            this._currentRow = this.getLineWithCursor(String(tokenResult.tokenValue).length);
            this._currentCol = this.getColumnWithCursor(String(tokenResult.tokenValue).length, String(tokenResult.tokenValue).split('\n')[0]);
            if (tokenType == 'VARIABLEDECLARATION') {
                if (currentRowChange != this._currentRow)  {
                    console.log("Current Row has Changed");
                }else{
                    console.log("Current Row has not Changed");
                }
            }
            return createToken(this._currentRow, this._currentCol, tokenType, tokenResult.tokenValue, tokenResult.tokenMatch);
        }

        // Handle unmatched token
        const unmatchedToken = string.split('\n')[0]; // Get the current line
        this._cursor += unmatchedToken.length; // Move the cursor to the end of the unmatched line
        let unmatchedTokenObj = createToken(this._currentRow, this._currentCol, 'UNMATCHED', unmatchedToken, null);
        unmatchedTokenObj.definedInSpec = "UNMATCHED";
        errorHandler._unexpected(unmatchedTokenObj, this._parentParser);
        return unmatchedTokenObj;
    }


    eatOpenBlock(val, token) {
        this._blocks.push(val)

        let buildToken = scan.eatValue("{", this._parentParser, token)
        if (buildToken.tokenMatch.closeCurly == "}") {
            return false
        } else {
            return true
        }

    }

    eatCloseBlock(token, parser) {

        this.addToken(token, parser)

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

                case 'VARIABLEDECLARATION':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.VariableDeclaration)

                    break;

                case 'INITIALIZATIONSTATEMENT':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.InitializationStatement)

                    break;

                case 'IF':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.ifCall)

                case 'ELSE':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.elseCall)

                    break;
                case 'CLOSINGBLOCK':
                    parser._lookBehind = parser._lookahead;
                    parser.pushToken(parser.ClosingBlockLiteral)

                    break;

                default:
                    errorHandler._unexpected(token, '', parser)
                    // throw new SyntaxError(`Literal: unexpected literal production`);

            }
        } while (this.isEOB() === false && token.kind != 'CLOSINGBLOCK');
    }

}


