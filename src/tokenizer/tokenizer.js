import { createToken }  from '../types/tokens.js';

import { datatypes } from './specs/datatypes.js';
import { keywords } from './specs/keywords.js';
import { operators } from './specs/operators.js';
import { commonitems } from './specs/commonitems.js';

/**
 * Tokenizer for CAPL code
 * Tokenizes raw code into individual tokens.
 */
export default class Tokenizer {
    constructor() {
      this.tokenSpecs = datatypes.concat(keywords, commonitems, operators);
      this.datatypeslib = datatypes;
      this.keywordslib = keywords;
      this.operatorslib = operators;
      this.commonitemslib = commonitems;
    }

    tokenize(code) {
        let tokens = [];
        let index = 0;
        let line = 1;
        let column = 1;

        while (index < code.length) {
            let matched = false;

            for (let spec of this.tokenSpecs) {
                const match = code.slice(index).match(spec.regex);

                if (match) {
                    const value = match[0];

                    // Compute the token's position
                    const tokenRow = line;
                    const tokenCol = column;

                    // Count newlines and reset column if needed
                    const lines = value.split('\n');
                    if (lines.length > 1) {
                        line += lines.length - 1;
                        column = lines[lines.length - 1].length + 1;
                    } else {
                        column += value.length;
                    }

                    // Ignore whitespace/comments if needed
                    if (!['WHITESPACE', 'COMMENT_ENCODING', 'COMMENT_SINGLE_LINE', 'COMMENT_MULTI_LINE'].includes(spec.type)) {
                        // Special handling for struct identifiers
                        if (spec.type === 'DELIMITER_DOT' && tokens.length > 0) {
                            tokens[tokens.length - 1].type = 'IDENTIFIER_STRUCT';
                        }

                        const token = createToken(tokenRow, tokenCol, spec.type, value, match);
                        tokens.push(token);
                    }

                    index += value.length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Unrecognized token at line ${line}, column ${column}: ${code.slice(index, index + 20)}`);
            }
        }

        return tokens;
    }

    isDataType(type){
        const DeclarationDataType = this.datatypeslib.filter((item) =>  item.type === type);

        return DeclarationDataType.length > 0;
    }
}
