import * as errorHandler from '../parser/errors.js';
import { includesSpec, variablesSpec } from './specs.js';
import { createToken } from '../types/tokens.js';


export function eatValue(val, parser, token) {

    for (var keys in token.tokenMatch) {
        if (!Object.hasOwnProperty.bind(token.tokenMatch)(keys)) continue;
        if (token.tokenMatch[keys] === val) {
            return token;
        }
      }

      errorHandler.expecting(token, "'" + val + "'", parser)
}

export function see(parser, token, tokenizer, specType){

    // let updateCursor = tokenizer._cursor + token.tokenValue.length
    // tokenizer._cursor = updateCursor;

    token = scanNextToken(parser, token, tokenizer, specType)
    parser._lookahead = token;

    // if (tokenizer.isEOB()) {
    //     return token
    // } else {
    //     return token
    // }
    return token

}

export function scanNextToken(parser, token, tokenizer, specType){

    if (!tokenizer.hasMoreTokens()) {
        return null;
    }

    let specsArray =
    specType == "IncludesBody" ? includesSpec :
    specType == "VariblesBody" ? variablesSpec : [];

    const string = tokenizer._string.slice(tokenizer._cursor);

    for (const [tokenType, regexp] of specsArray) {
        const tokenResult = tokenizer._match(regexp, string);

        // save = tokenResult;
        if (tokenResult == null) {
            continue;
        }

        if (tokenType == null) {
            return scanNextToken(parser, token, tokenizer, specType);
        }

        tokenizer._currentRow = tokenizer.getLineWithCursor();
        tokenizer._currentCol = tokenizer.getColumnWithCursor(String(tokenResult.tokenValue).length)
        return createToken(
            tokenizer._currentRow,
            tokenizer._currentCol,
            tokenType,
            tokenResult.tokenValue,
            tokenResult.tokenMatch);
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`);

}