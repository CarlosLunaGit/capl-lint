// tests/tokenizer.test.js
import Tokenizer from '../../src/tokenizer/tokenizer.js';
const assert = require('assert');

function projectTokens(tokens) {
    return tokens.map(t => ({ type: t.type, value: t.value, row: t.row, col: t.col }));
}

describe('Tokenizer', () => {

    it('Should tokenize CAPL datatype INT', () => {
        const tokenizer = new Tokenizer();
        const code = 'int x;';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
            { type: 'INT', value: 'int', row: "1", col: "1" },
            { type: 'IDENTIFIER', value: 'x', row: "1", col: "5"  },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "6"  },
        ]);
    });

    it('Should tokenize CAPL keywords in IF statement single variable as conditional with integer comparison (equality)', () => {
        const tokenizer = new Tokenizer();
        const code = 'if (x == 10) { return "true"; }';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
            { type: 'IF', value: 'if', row: "1", col: "1" },
            { type: 'DELIMITER_OPEN_PAREN', value: '(', row: "1", col: "4" },
            { type: 'IDENTIFIER', value: 'x', row: "1", col: "5" },
            { type: 'OPERATOR_EQUAL', value: '==', row: "1", col: "7" },
            { type: 'LITERAL_NUMBER', value: '10', row: "1", col: "10" },
            { type: 'DELIMITER_CLOSE_PAREN', value: ')', row: "1", col: "12" },
            { type: 'DELIMITER_OPEN_BRACE', value: '{', row: "1", col: "14" },
            { type: 'RETURN', value: 'return', row: "1", col: "16" },
            { type: 'LITERAL_STRING', value: '"true"', row: "1", col: "23" },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "29" },
            { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: "1", col: "31" },

        ]);
    });

    it('Should tokenize Variable assigments with Member access operator for User Defined/CAPL Structs', () => {
        const tokenizer = new Tokenizer();
        const code = 'UserStruct.member = 10;';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
            { type: 'IDENTIFIER_STRUCT', value: 'UserStruct', row: "1", col: "1" },
            { type: 'DELIMITER_DOT', value: '.', row: "1", col: "11" },
            { type: 'IDENTIFIER', value: 'member', row: "1", col: "12" },
            { type: 'ASSIGNMENT', value: '=', row: "1", col: "19" },
            { type: 'LITERAL_NUMBER', value: '10', row: "1", col: "21" },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "23" },

        ]);
    });

    it('Should tokenize array indexing', () => {
        const tokenizer = new Tokenizer();
        const code = 'x[5] = 3;';
        const tokens = tokenizer.tokenize(code);
        assert.deepEqual(projectTokens(tokens), [
          { type: 'IDENTIFIER', value: 'x', row: "1", col: "1" },
          { type: 'DELIMITER_OPEN_BRACKET', value: '[', row: "1", col: "2" },
          { type: 'LITERAL_NUMBER', value: '5', row: "1", col: "3" },
          { type: 'DELIMITER_CLOSE_BRACKET', value: ']', row: "1", col: "4" },
          { type: 'ASSIGNMENT', value: '=', row: "1", col: "6" },
          { type: 'LITERAL_NUMBER', value: '3', row: "1", col: "8" },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "9" }
        ]);
      });

      it('Should skip multiline comments', () => {
        const tokenizer = new Tokenizer();
        const code = '/* comment */ int x;';
        const tokens = tokenizer.tokenize(code);
        // Ensure comment is skipped
        assert.deepEqual(projectTokens(tokens), [
            { type: 'INT', value: 'int', row: "1", col: "15" },
            { type: 'IDENTIFIER', value: 'x', row: "1", col: "19" },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "20" }
          ]);
      });

      it('Should tokenize logical AND and OR operators', () => {
        const tokenizer = new Tokenizer();
        const code = 'if (a && b || c) { return; }';
        const tokens = tokenizer.tokenize(code);
        // Add expected tokens including OPERATOR_AND and OPERATOR_OR

        assert.deepEqual(projectTokens(tokens), [
            { type: 'IF', value: 'if', row: "1", col: "1" },
            { type: 'DELIMITER_OPEN_PAREN', value: '(', row: "1", col: "4" },
            { type: 'IDENTIFIER', value: 'a', row: "1", col: "5" },
            { type: 'AND', value: '&&', row: "1", col: "7" },
            { type: 'IDENTIFIER', value: 'b', row: "1", col: "10" },
            { type: 'OR', value: '||', row: "1", col: "12" },
            { type: 'IDENTIFIER', value: 'c', row: "1", col: "15" },
            { type: 'DELIMITER_CLOSE_PAREN', value: ')', row: "1", col: "16" },
            { type: 'DELIMITER_OPEN_BRACE', value: '{', row: "1", col: "18" },
            { type: 'RETURN', value: 'return', row: "1", col: "20" },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "26" },
            { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: "1", col: "28" }

        ]);
      });

      it('Should tokenize a function call', () => {
        const tokenizer = new Tokenizer();
        const code = 'log("hello");';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
            { type: 'IDENTIFIER', value: 'log', row: "1", col: "1" },
            { type: 'DELIMITER_OPEN_PAREN', value: '(', row: "1", col: "4" },
            { type: 'LITERAL_STRING', value: '"hello"', row: "1", col: "5" },
            { type: 'DELIMITER_CLOSE_PAREN', value: ')', row: "1", col: "12" },
            { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "13" }

        ]);
      });

      it('Should tokenize a function call with multiple arguments', () => {
        const tokenizer = new Tokenizer();
        const code = 'calculate(x, 5, "test");';
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
          { type: 'IDENTIFIER', value: 'calculate', row: "1", col: "1" },
          { type: 'DELIMITER_OPEN_PAREN', value: '(', row: "1", col: "10" },
          { type: 'IDENTIFIER', value: 'x', row: "1", col: "11" },
          { type: 'DELIMITER_COMMA', value: ',', row: "1", col: "12" },
          { type: 'LITERAL_NUMBER', value: '5', row: "1", col: "14" },
          { type: 'DELIMITER_COMMA', value: ',', row: "1", col: "15" },
          { type: 'LITERAL_STRING', value: '"test"', row: "1", col: "17" },
          { type: 'DELIMITER_CLOSE_PAREN', value: ')', row: "1", col: "23" },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: "1", col: "24" }
        ]);
      });

      it('Should tokenize an Includes Block and body', () => {
        const tokenizer = new Tokenizer();
        const code = String.raw`includes
{
// Standard libraries
  #include "..\TestLibraries\constants.cin"
  #include "..\TestLibraries\types.cin"

}`;
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
          { type: 'INCLUDESBLOCK', value: 'includes', row: 1, col: 1 },
          { type: 'DELIMITER_OPEN_BRACE', value: '{', row: 2, col: 1 },
          { type: 'HASH', value: '#', row: 4, col: 3 },
          { type: 'INCLUDE', value: 'include', row: 4, col: 4 },
          { type: 'LITERAL_STRING', value: '\"..\\TestLibraries\\constants.cin\"', row: 4, col: 12 },
          { type: 'HASH', value: '#', row: 5, col: 3 },
          { type: 'INCLUDE', value: 'include', row: 5, col: 4 },
          { type: 'LITERAL_STRING', value: '\"..\\TestLibraries\\types.cin\"', row: 5, col: 12 },
          { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: 7, col: 1 }
        ]);
      });

      it('Should tokenize a Variables Block and body', () => {
        const tokenizer = new Tokenizer();
        const code = String.raw`variables
{
    int integerVariable1;
    dword dwordVariable1;
}`;
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
          { type: 'VARIABLESBLOCK', value: 'variables', row: 1, col: 1 },
          { type: 'DELIMITER_OPEN_BRACE', value: '{', row: 2, col: 1 },
          { type: 'INT', value: 'int', row: 3, col: 5 },
          { type: 'IDENTIFIER', value: 'integerVariable1', row: 3, col: 9 },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: 3, col: 25 },
          { type: 'DWORD', value: 'dword', row: 4, col: 5 },
          { type: 'IDENTIFIER', value: 'dwordVariable1', row: 4, col: 11 },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: 4, col: 25 },
          { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: 5, col: 1 }
        ]);
      });

      it('Should tokenize an Variables Block and body', () => {
        const tokenizer = new Tokenizer();
        const code = String.raw`testcase testCaseName1(byte argumentByte1, enum ENUM_TYPE argumentEnum1, struct STRUCT_TYPE argumentStruct1, int argumentInt1)
{
    byte localVariable1[8];
    byte LocalVariable2[8];

    localVariable1[0] =  argumentInt1;


}`;
        const tokens = tokenizer.tokenize(code);

        assert.deepEqual(projectTokens(tokens), [
          { type: 'TESTCASE', value: 'testcase', row: 1, col: 1 },
          { type: 'IDENTIFIER', value: 'testCaseName1', row: 1, col: 10 },
          { type: 'DELIMITER_OPEN_PAREN', value: '(', row: 1, col: 23 },
          { type: 'BYTE', value: 'byte', row: 1, col: 24 },
          { type: 'IDENTIFIER', value: 'argumentByte1', row: 1, col: 29 },
          { type: 'DELIMITER_COMMA', value: ',', row: 1, col: 42 },
          { type: 'ENUM', value: 'enum', row: 1, col: 44 },
          { type: 'IDENTIFIER', value: 'ENUM_TYPE', row: 1, col: 49 },
          { type: 'IDENTIFIER', value: 'argumentEnum1', row: 1, col: 59 },
          { type: 'DELIMITER_COMMA', value: ',', row: 1, col: 72 },
          { type: 'STRUCT', value: 'struct', row: 1, col: 74 },
          { type: 'IDENTIFIER', value: 'STRUCT_TYPE', row: 1, col: 81 },
          { type: 'IDENTIFIER', value: 'argumentStruct1', row: 1, col: 93 },
          { type: 'DELIMITER_COMMA', value: ',', row: 1, col: 108 },
          { type: 'INT', value: 'int', row: 1, col: 110 },
          { type: 'IDENTIFIER', value: 'argumentInt1', row: 1, col: 114 },
          { type: 'DELIMITER_CLOSE_PAREN', value: ')', row: 1, col: 126 },
          { type: 'DELIMITER_OPEN_BRACE', value: '{', row: 2, col: 1 },
          { type: 'BYTE', value: 'byte', row: 3, col: 5 },
          { type: 'IDENTIFIER', value: 'localVariable1', row: 3, col: 10 },
          { type: 'DELIMITER_OPEN_BRACKET', value: '[', row: 3, col: 24 },
          { type: 'LITERAL_NUMBER', value: '8', row: 3, col: 25 },
          { type: 'DELIMITER_CLOSE_BRACKET', value: ']', row: 3, col: 26 },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: 3, col: 27 },
          { type: 'BYTE', value: "byte", row: 4, col: 5 },
          { type: 'IDENTIFIER', value: 'LocalVariable2', row: 4, col: 10 },
          { type: 'DELIMITER_OPEN_BRACKET', value: '[', row: 4, col: 24 },
          { type: 'LITERAL_NUMBER', value: '8', row: 4, col: 25 },
          { type: 'DELIMITER_CLOSE_BRACKET', value: ']', row: 4, col: 26 },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: 4, col: 27 },
          { type: 'IDENTIFIER', value: 'localVariable1', row: 6, col: 5 },
          { type: 'DELIMITER_OPEN_BRACKET', value: '[', row: 6, col: 19 },
          { type: 'LITERAL_NUMBER', value: '0', row: 6, col: 20 },
          { type: 'DELIMITER_CLOSE_BRACKET', value: ']', row: 6, col: 21 },
          { type: 'ASSIGNMENT', value: '=', row: 6, col: 23 },
          { type: 'IDENTIFIER', value: 'argumentInt1', row: 6, col: 26 },
          { type: 'DELIMITER_SEMICOLON', value: ';', row: 6, col: 38 },
          { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: 9, col: 1 },


        ]);
      });

        it('Should tokenize byte array initialization', () => {
            const tokenizer = new Tokenizer();
            const code = 'byte variable1[3] = {0x01, 0x02, 0x03};';
            const tokens = tokenizer.tokenize(code);

            assert.deepEqual(projectTokens(tokens), [
            { type: 'BYTE', value: 'byte', row: 1, col: 1 },
            { type: 'IDENTIFIER', value: 'variable1', row: 1, col: 6 },
            { type: 'DELIMITER_OPEN_BRACKET', value: '[', row: 1, col: 15 },
            { type: 'LITERAL_NUMBER', value: '3', row: 1, col: 16 },
            { type: 'DELIMITER_CLOSE_BRACKET', value: ']', row: 1, col: 17 },
            { type: 'ASSIGNMENT', value: '=', row: 1, col: 19 },
            { type: 'DELIMITER_OPEN_BRACE', value: '{', row: 1, col: 21 },
            { type: 'LITERAL_HEXADECIMAL', value: '0x01', row: 1, col: 22 },
            { type: 'DELIMITER_COMMA', value: ',', row: 1, col: 26 },
            { type: 'LITERAL_HEXADECIMAL', value: '0x02', row: 1, col: 28 },
            { type: 'DELIMITER_COMMA', value: ',', row: 1, col: 32 },
            { type: 'LITERAL_HEXADECIMAL', value: '0x03', row: 1, col: 34 },
            { type: 'DELIMITER_CLOSE_BRACE', value: '}', row: 1, col: 38 },
            { type: 'DELIMITER_SEMICOLON', value: ';', row:1, col:39}
            ]);
        });

});



