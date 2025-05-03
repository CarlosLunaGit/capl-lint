
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
        let remainingCode = code.trim(); // Trim leading/trailing spaces

        while (remainingCode.length > 0) {

            let matched = false;

            for (let spec of this.tokenSpecs) {

                const match = remainingCode.match(spec.regex);

                if (match) {
                    // Ignore whitespace tokens
                    // Ignore comments
                    if (spec.type !== 'WHITESPACE' &&
                        spec.type !== 'COMMENT_ENCODING'
                        && spec.type !== 'COMMENT_SINGLE_LINE'
                        && spec.type !== 'COMMENT_MULTI_LINE') {
                        tokens.push({
                            type: spec.type,
                            value: match[0],
                        });
                    }

                    remainingCode = remainingCode.slice(match[0].length).trimStart(); // Remove matched part & trim leading space
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Unrecognized token at: ${remainingCode}`);
            }
        }

        return tokens;
        }
}
