// tests/linter.test.js
import Linter from '../../src/core/linter';
const assert = require('assert');

describe('Linter', () => {

    it('Should report an ERROR on a missing HASH symbol within an Include Statement', () => {
        const linter = new Linter();
        const code = `includes
                        {
                        // Standard libraries
                        include "..\TestLibraries\constants.cin"
                        #include "..\TestLibraries\types.cin"

                        }`;
        const result = linter.lint(code);

        assert.deepEqual(result, { errors: [{ message: `Missing '#' at the beginning of 'IncludeStatement'`, type: 'Error' }]});
    });

    it('Should report an ERROR on NOT ALLOWED statement within includes block', () => {
        const linter = new Linter();
        const code = `includes
                        {
                        // Standard libraries
                        #include "..\TestLibraries\constants.cin"
                        #include "..\TestLibraries\types.cin"
                        int x;
                        }`;
        const result = linter.lint(code);

        assert.deepEqual(result, { errors: [{ message: `Not allowed statement within 'IncludeBlockStatement'`, type: 'Error' }]});
    });

    it('Should report a WARNING on an Unused Variable', () => {
        const linter = new Linter();
        const code = 'int x; if (y) { return; }';

        const result = linter.lint(code);

        assert.deepEqual(result, {errors: [{message: 'Unused variable: x', type: 'Warning'}]});
    });

    it('Should report an ERROR on a missing Colon', () => {
        const linter = new Linter();
        const code = `int x`;

        const result = linter.lint(code);

        assert.deepEqual(result, {errors: [
                {message: "Unused variable: x", type: "Warning"},
                {message: "Missing semicolon at the end of 'VariableDeclaration'", row: 1, col: 5, type: "Error"}
            ]
        });
    });

    it('Should throw error for missing semicolon in assignment', () => {
        const linter = new Linter();
        const code = 'UserStruct.member = 10';

        const result = linter.lint(code);

        assert.deepEqual(result, {errors: [
                {message: "Missing semicolon at the end of 'StructMemberVariableInitialization'", row: 1, col: 1, type: "Error"}
            ]
        });
      });
});
