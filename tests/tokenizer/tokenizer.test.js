// tests/tokenizer.test.js
import Tokenizer from '../../src/tokenizer/tokenizer.js';
const assert = require('assert');

describe('Tokenizer', () => {

    it('Should tokenize CAPL datatype INT', () => {
        const tokenizer = new Tokenizer();
        const code = 'int x;';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(tokens, [
            { type: 'INT', value: 'int' },
            { type: 'IDENTIFIER', value: 'x' },
            { type: 'DELIMITER_SEMICOLON', value: ';' },
        ]);
    });

    it('Should tokenize CAPL keywords in IF statement single variable as conditional with integer comparison (equality)', () => {
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

    it('Should tokenize Variable assigments with Member access operator for User Defined/CAPL Structs', () => {
        const tokenizer = new Tokenizer();
        const code = 'UserStruct.member = 10;';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(tokens, [
            { type: 'IDENTIFIER_STRUCT', value: 'UserStruct' },
            { type: 'DELIMITER_DOT', value: '.' },
            { type: 'IDENTIFIER', value: 'member' },
            { type: 'ASSIGNMENT', value: '=' },
            { type: 'LITERAL_NUMBER', value: '10' },
            { type: 'DELIMITER_SEMICOLON', value: ';' },

        ]);
    });

    it('Should tokenize array indexing', () => {
        const tokenizer = new Tokenizer();
        const code = 'x[5] = 3;';
        const tokens = tokenizer.tokenize(code);
        assert.deepEqual(tokens, [
          { type: 'IDENTIFIER', value: 'x' },
          { type: 'DELIMITER_OPEN_BRACKET', value: '[' },
          { type: 'LITERAL_NUMBER', value: '5' },
          { type: 'DELIMITER_CLOSE_BRACKET', value: ']' },
          { type: 'ASSIGNMENT', value: '=' },
          { type: 'LITERAL_NUMBER', value: '3' },
          { type: 'DELIMITER_SEMICOLON', value: ';' }
        ]);
      });

      it('Should skip multiline comments', () => {
        const tokenizer = new Tokenizer();
        const code = '/* comment */ int x;';
        const tokens = tokenizer.tokenize(code);
        // Ensure comment is skipped
        assert.deepEqual(tokens, [
            { type: 'INT', value: 'int' },
            { type: 'IDENTIFIER', value: 'x' },
            { type: 'DELIMITER_SEMICOLON', value: ';' }
          ]);
      });

      it('Should tokenize logical AND and OR operators', () => {
        const tokenizer = new Tokenizer();
        const code = 'if (a && b || c) { return; }';
        const tokens = tokenizer.tokenize(code);
        // Add expected tokens including OPERATOR_AND and OPERATOR_OR

        assert.deepEqual(tokens, [
            { type: 'IF', value: 'if' },
            { type: 'DELIMITER_OPEN_PAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'a' },
            { type: 'AND', value: '&&' },
            { type: 'IDENTIFIER', value: 'b' },
            { type: 'OR', value: '||' },
            { type: 'IDENTIFIER', value: 'c' },
            { type: 'DELIMITER_CLOSE_PAREN', value: ')' },
            { type: 'DELIMITER_OPEN_BRACE', value: '{' },
            { type: 'RETURN', value: 'return' },
            { type: 'DELIMITER_SEMICOLON', value: ';' },
            { type: 'DELIMITER_CLOSE_BRACE', value: '}' }

        ]);
      });


});
