const { lintCode, identicationTypesTest } = require('../../src/core/lintCode').default;
import { Parser } from '../../src/parser/parser.js';

// describe('Errors Suite', () => {

    // test('lindCode detects missing comma to separate parameters in TESTCASE.', async () => {
    //     const inputCode =
    //     `/*@!Encoding:65001*/
    // /**
    //  * @file testCase01BlockSizeValueHandlingCANGroup.cin
    //  */
    // includes
    // {


    // }

    // variables
    // {


    // }

    // testcase testCase01BlockSizeValueHandlingCANGroup(byte session_ind enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)
    // {
    //     byte payload[8];
    //     byte validation[8];
    //     int dataLength;
    //     char out[100];
    //     char textDeviceUnderTest[50];

    //     dutData.FC_WAIT_DELAY = data.FC_WAIT_DELAY;
    //     dutData.FC_DELAY = data.FC_DELAY;
    //     dutData.BS = data.BS;
    //     dutData.STmin = data.STmin;
    //     strncpy(textDeviceUnderTest, "Device under test: ", 20);

    // }`;
    //     const expectedErrors = [
    //         {
    //             line: 17,
    //             error: 'Missing comma to separate parameters in function declaration. Statement: - testCase01BlockSizeValueHandlingCANGroup(byte session_ind enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)',
    //             priority: 1,
    //             type: "Error" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })





//   })

//   describe('Format Rules Suite', () => {

//     test('lintCode suggest opening CURLY BRACKET must be on the same line', async () => {
//     const inputCode =
//         `variables
//         {
//             byte variable1[3]={0x01,0x02,0x03};
//             byte variable2[3]={0x04,0x05,0x06};
//             int x = 10;
//             int y = 20;
//         }`;
//         const expectedErrors = [
//             {
//                 line: 1,
//                 error: 'Opening curly bracket must be on the same line as the keyword for control structures. Statement: - variables',
//                 priority: 2,
//                 type: "Format Rules (Clang)"
//             }
//         ];
//         console.log(expectedErrors);
//         let evaluatedErrors = await lintCode(inputCode);
//         console.log(evaluatedErrors);
//         expect(evaluatedErrors).toEqual(expectedErrors);
//     });

//   })


describe('Test case for If statements handlers', () => {

    test('Types', async () => {
        const inputCode =
        `
        // Inline with opening curly bracket
        // If statement single integer as conditional
        if (1) {

        // If statement single variable as conditional
        if (condition) {

        // If statement single interger as conditional with integer comparison (equality)
        if ( 1 == 1) {

        // If statement single variable as conditional with integer comparison (not equality)
        if (condition != 1) {

        // If statement single variable as conditional with integer comparison (equality)
        if (condition == 1) {

        // If statement single variable as conditional with variable comparison (equality)
        if (condition == condition2) {

        // If statement system variable as conditional with integer comparison (equality)
        if (@sysvar::namespace::variable == 1) {

        // Inline without opening curly bracket
        // If statement single integer as conditional
        if (1)

        // End of file

        `;

        const expectedTokens = [
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCall"},
            {kind: "ifCallNoBrackets"},
            {kind: "endOfFile"}
        ];

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);

        console.log(parserHandler.tokens);
        expect(parserHandler.tokens).toMatchObject(expectedTokens);
    })

});

describe('Errors Suite', () => {

    test('lintCode detects missing "#" on Include statements', async () => {

        const inputCode =
        `includes
        {
            // Comment
            #include "..\\TestLibraries\\responses.cin"
            include "..\\TestLibraries\\utils.cin"

        }`;

        const expectedErrors = [
            {
                line: 5,
                col: 12,
                error: 'ERROR: On statement \"include \"..\\TestLibraries\\utils.cin\"\" (expecting \"#\")',
                priority: 1,
                type: "Error"
            }
        ];

        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects not allowed statements within INCLUDES Block', async () => {

        const inputCode =
        `includes
        {
            // Comment
            #include "..\\TestLibraries\\responses.cin"
            #include "..\\TestLibraries\\utils.cin"
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x01,0x02,0x03};
        }`;

        const expectedErrors = [
            {
                line: 6,
                col: 12,
                error: 'ERROR: On statement \"byte variable1[3]={0x01,0x02,0x03};\" (unexpected \"statement, only \"#include\" statements are allowed within the Include block\")',
                priority: 1,
                type: "Error"
            },
            {
                line: 7,
                col: 12,
                error: 'ERROR: On statement \"byte variable2[3]={0x01,0x02,0x03};\" (unexpected \"statement, only \"#include\" statements are allowed within the Include block\")',
                priority: 1,
                type: "Error"
            }
        ];

        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects not allowed statements within VARIABLES Block', async () => {
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            // Comment
            byte variable2[3]={0x04,0x05,0x06};
            int x = 10;
            int y = 20;
            #include "..\\myLibraries\\utils.cin"
        }`;
        const expectedErrors = [
            {
                line: 8,
                col: 12,
                error: 'ERROR: On statement \"#include \"..\\myLibraries\\utils.cin\"\" (unexpected \"statement, only variables definitions and initializations are allowed within the Variable block\")',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lintCode detects not allowed statements within VARIABLES Block (const prefix case)', async () => {
        const inputCode =
        `/*@!Encoding:65001*/
        includes
        {

        }

        variables
        {

            const int varInt=105;
            char varChar[5];
            byte varByte1[3];
            byte varByte2[3];
            byte varByte3[3];
            #include "..\\TestLibraries\\utils.cin"

        }`;
        const expectedErrors = [
            {
                line: 15,
                col: 12,
                error: 'ERROR: On statement \"#include \"..\\TestLibraries\\utils.cin\"\" (unexpected \"statement, only variables definitions and initializations are allowed within the Variable block\")',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lintCode detects missing semicolons for LINE STATEMENTS', async () => {
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            // Missing semicolon in Variables Block
            byte variable2[3]={0x04,0x05,0x06}
            int w = 10;
            int x = 10;
            int y = 20;
        }
        void MainTest ()
        {
            int z;
            z = x + y;
            // some comments
            if (1){
                write("%d",z);
                // Missing semicolon in Line Statement
                write("%d",w)
            }
	    }`;
        const expectedErrors = [
            {
                line: 5,
                col: 12,
                error: 'ERROR: On statement \"byte variable2[3]={0x04,0x05,0x06}\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 18,
                col: 16,
                error: 'ERROR: On statement \"write(\"%d\",w)\" (expecting ;)',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects missing semicolons for Variables declaration (with Comment lines)', async () => {
        const inputCode =
        `/**
        * @var Doxygen comment
        * @brief This is a classic Doxygen compliance comment block
        */
        variables {
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x04,0x05,0x06}
            int x = 10;
            int y = 20
        }
        testcase function1(int param1)
        {
            byte varLocal1[8];
            byte varLocal2[8];
            int varLocal3;
            char varLocal4[100];
            char varLocal5[50]

            varLocal1.prop1 = varLocal2
        }`;
        const expectedErrors = [
            {
                line: 7,
                col: 12,
                error: 'ERROR: On statement \"byte variable2[3]={0x04,0x05,0x06}\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 9,
                col: 12,
                error: 'ERROR: On statement \"int y = 20\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 17,
                col: 12,
                error: 'ERROR: On statement \"char varLocal5[50]\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 19,
                col: 12,
                error: 'ERROR: On statement \"varLocal1.prop1 = varLocal2\" (expecting ;)',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects missing semicolons for Variables declaration (Multi-line case)', async () => {
        const inputCode =
        `variables
        {
            byte variable1[3]={0x62,0xED,0xA0};
            byte variable2[3]={0x62,0xEE,0x01}
            int x = 10;
            int y = 20

            struct varitableStructType {
                char varChar[5];
                byte varByte1[3];
                byte varByte2[3];
                byte varByte3[3];
            } variableStructName[200]
        }`;
        const expectedErrors = [
            {
                line: 4,
                col: 12,
                error: 'ERROR: On statement \"byte variable2[3]={0x62,0xEE,0x01}\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 6,
                col: 12,
                error: 'ERROR: On statement \"int y = 20\" (expecting ;)',
                priority: 1,
                type: "Error" },
            {
                line: 8,
                col: 12,
                error: `ERROR: On statement \"struct varitableStructType {
                char varChar[5];
                byte varByte1[3];
                byte varByte2[3];
                byte varByte3[3];
            } variableStructName[200]
        \" (expecting ;)`,
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects Duplicated variables declaration', async () => { // TODO fix parser logic to handle local variables
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            int x = 10;
            int y = 10;
            int z = 20;
        }
        void MainTest ()
        {
            int localVar1;
            int localVar1;
            z = x + y;

            write("%d",z);

	    }`;
        const expectedErrors = [
            {
                line: 11,
                col: 12,
                error: 'ERROR: Variable already declared at the same local scope at row 10',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects Duplicated variables declaration (Locally scoped duplication is allowed, when duplication happens in multiple blocks)', async () => { // TODO fix parser logic to handle local variables
        const inputCode =
        `includes{
        }
        variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            int x = 10;
            int y = 10;
            int z = 20;
        }
        void MainTest ()
        {
            int localScopeAllowed;
            z = x + y;

            write("%d",z);

	    }

        void myTestingFunction () {

            int localScopeAllowed;
            z = x + y;

            write("%d",z);

        }
        `;
        const expectedErrors = [];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects Duplicated variables declaration (Overwriting values)', async () => { // TODO fix parser logic to handle local variables
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            int x = 10;
            int y = 10;
            int z = 20;
        }
        void MainTest ()
        {
            int z;
            z = x + y;

            write("%d",z);

	    }`;
        const expectedErrors = [
            {
                line: 10,
                col: 12,
                error: 'WARNING: Variable value initialized at row 6 will be overwritten by the new value at row 10. Statement: - int z;',
                priority: 2,
                type: "Warning" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION.', async () => {
        const inputCode =
        `/*@!Encoding:1252*/
        includes
        {

        }

        variables {

        }

        void MainTest ()
        {
            int x = 10;
            int y = 20;
            int z;

            z = x + y;

            // A comment statement
            if (1){
            write("%d",z);
                int w = 10; // Error here
                write("%d",w);
            }

        }`;
        const expectedErrors = [
            {
                line: 22,
                col: 16,
                error: 'ERROR: On statement \"int w = 10;\" (unexpected \"Declaration of local VARIABLES must happen at the beginning of a FUNCTION block\")',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lindCode detects declaration of local variables not at the beginning portion of the TESTCASE.', async () => {
        const inputCode =
        `/*@!Encoding:65001*/
    /**
     * @file testCase01BlockSizeValueHandlingCANGroup.cin
     */
    includes
    {


    }

    variables
    {


    }

    testcase myTestCase(byte data, enum ENUMERATION mode)
    {
        byte data1[8];
        byte data2[8];
        int dataLength;
        char text1[100];
        char text2[50];

        dutData.D1 = data1;
        dutData.D2 = data2;
        dutData.DL = dataLength;

        int x;
        strncpy(text1, text2, elcount(text1));

    }`;
        const expectedErrors = [
            {
                line: 29,
                col: 8,
                error: 'ERROR: On statement \"int x;\" (unexpected \"Declaration of local VARIABLES must happen at the beginning of a FUNCTION block\")',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lintCode detects parse errors (Unexpected Literals)', async () => { // TODO fix parser logic to handle local variables
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            int x = 20;
            int z = 20;
        }
        void MainTest ()
        {
            x
            write("Hello World %d",z);.

	    }`;
        const expectedErrors = [
            {
                line: 9,
                col: 12,
                error: 'ERROR: Variable declared but not a valid statement, Parse Error',
                priority: 1,
                type: "Error" },
            {
                line: 10,
                col: 38,
                error: 'ERROR: Variable not declared or unexpected statement, Parse Error',
                priority: 1,
                type: "Error" }

        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lindCode detects wrong FUNCTION declaration (function type array).', async () => {
        const inputCode =
        `/*@!Encoding:1252*/
        includes
        {

        }

        variables
        {


        }

        byte[] myFunctionOfTypeArray()
        {

            int x = 10;
            int y = 20;
            int z;
            z = x + y;
            // some comments
            if (1){
            write("%d",z);
                write("%d",w);
            }
            return [];
        }`;
        const expectedErrors = [
            {
                line: 13,
                col: 8,
                error: 'ERROR: Function declaration is not valid, cannot be of type: byte[]',
                priority: 1,
                type: "Error" }
        ];
        // console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })



});
