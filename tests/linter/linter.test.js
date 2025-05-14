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

        assert.deepEqual(result, {errors: [
            {
                message: "Variable 'x' is DECLARED but never USED.",
                type: 'Warning',
                col: 5,
                row: 1
            },{
                message: "Variable 'y' is USED but never DECLARED.",
                type: 'Error',
                col: 12,
                row: 1
            }
        ]});
    });

    it('Should report an ERROR on a missing Colon', () => {
        const linter = new Linter();
        const code = `int x`;

        const result = linter.lint(code);

        assert.deepEqual(result, {errors: [
                {message: "Variable 'x' is DECLARED but never USED.", type: "Warning", row: 1, col: 5,},
                {message: "Missing semicolon at the end of 'VariableDeclaration': x", row: 1, col: 5, type: "Error"}
            ]
        });
    });

    it('Should throw error for missing semicolon in assignment', () => {
        const linter = new Linter();
        const code = 'UserStruct.member = 10';

        const result = linter.lint(code);

        assert.deepEqual(result, {errors: [
            {message: "Variable 'UserStruct.member' is USED but never DECLARED.", type: "Error", row: 1, col: 1,},
                {message: "Missing semicolon at the end of 'StructMemberVariableInitialization': UserStruct", row: 1, col: 1, type: "Error"}
            ]
        });
      });

    it('Should detect unused declared variables in scope', () => {
        const linter = new Linter();

        const code = `
            variables
            {
                dword reqid;
            }

            testcase testCaseName1(byte argumentByte1)
            {
                byte localVariable1[8];
                dword respid;
                write("Print message", localVariable1);

                if (argumentByte1) { return 10; }

            }
        `;

        const result = linter.lint(code);

        assert.deepEqual(result, {
            errors: [

                {
                    message: "Variable 'reqid' is DECLARED but never USED.",
                    row: 4, col: 23, type: "Warning"
                },
                {
                    message: "Variable 'respid' is DECLARED but never USED.",
                    row: 10, col: 23, type: "Warning"
                }
            ]
        });
    });

    it('Should detect declared variables not placed at the beginning of a block', () => {
        const linter = new Linter();

        const code = `
            variables
            {
                dword reqid;
            }

            testcase testCaseName1(byte argumentByte1)
            {
                byte localVariable1[8];
                write("Print message", localVariable1);

                if (argumentByte1) { return 10; }

                dword respid;
            }
        `;

        const result = linter.lint(code);

        assert.deepEqual(result, {
            errors: [

                {
                    message: "Variable 'reqid' is DECLARED but never USED.",
                    row: 4, col: 23, type: "Warning"
                },
                {
                    message: "Variable 'respid' is DECLARED but never USED.",
                    row: 14, col: 23, type: "Warning"
                },
                {
                    message: "Variable declarations should happen at the start of a block. Misplaced variable: respid",
                    row: 14, col: 23, type: "Error",
                }
            ]
        });
    });

});
