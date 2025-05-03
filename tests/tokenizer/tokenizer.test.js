// tests/tokenizer.test.js
import Tokenizer from '../../src/tokenizer/tokenizer.js';
const assert = require('assert');

describe('Tokenizer', () => {

    it('should tokenize CAPL datatype INT', () => {
        const tokenizer = new Tokenizer();
        const code = 'int x;';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(tokens, [
            { type: 'INT', value: 'int' },
            { type: 'IDENTIFIER', value: 'x' },
            { type: 'DELIMITER_SEMICOLON', value: ';' },
        ]);
    });

    it('should tokenize CAPL keywords in IF statement single variable as conditional with integer comparison (equality)', () => {
        const tokenizer = new Tokenizer();
        const code = 'if (x == 10) { return "true"; }';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(tokens, [
            { type: 'IF', value: 'if' },
            { type: 'DELIMITER_OPEN_PAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'x' },
            { type: 'OPERATOR_EQUAL', value: '==' },
            { type: 'LITERAL_NUMBER', value: '10' },
            { type: 'DELIMITER_CLOSE_PAREN', value: ')' },
            { type: 'DELIMITER_OPEN_BRACE', value: '{' },
            { type: 'RETURN', value: 'return' },
            { type: 'LITERAL_STRING', value: '"true"' },
            { type: 'DELIMITER_SEMICOLON', value: ';' },
            { type: 'DELIMITER_CLOSE_BRACE', value: '}' },

        ]);
    });


});
