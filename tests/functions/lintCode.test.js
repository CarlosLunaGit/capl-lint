const { lintCode, identicationTypesTest } = require('../../src/core/lintCode').default;
import { Parser } from '../../src/parser/parser.js';

// describe('Critical Rules Suite', () => {

    // test('lintCode detects not allowed statements within INCLUDES Block', async () => {

    //     const inputCode =
    //     `includes
    //     {
    //         // Comment
    //         #include "..\\TestLibraries\\responses.cin"
    //         #include "..\\TestLibraries\\utils.cin"
    //         byte variable1[3]={0x01,0x02,0x03};
    //         byte variable2[3]={0x01,0x02,0x03};
    //     }`;

    //     const expectedErrors = [
    //         {
    //             line: 6,
    //             error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte variable1[3]={0x01,0x02,0x03};',
    //             priority: 1,
    //             type: "Critical Rule"
    //         },
    //         {
    //             line: 7,
    //             error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte variable2[3]={0x01,0x02,0x03};',
    //             priority: 1,
    //             type: "Critical Rule"
    //         }
    //     ];

    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // });

    // test('lintCode detects not allowed statements within VARIABLES Block', async () => {
    //     const inputCode =
    //     `variables
    //     {
    //         byte variable1[3]={0x01,0x02,0x03};
    //         // Comment
    //         byte variable2[3]={0x04,0x05,0x06};
    //         int x = 10;
    //         int y = 20;
    //         #include "..\\myLibraries\\utils.cin"
    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 8,
    //             error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\myLibraries\\utils.cin"',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

    // test('lintCode detects not allowed statements within VARIABLES Block (const prefix case)', async () => {
    //     const inputCode =
    //     `/*@!Encoding:65001*/
    //     includes
    //     {

    //     }

    //     variables
    //     {

    //         const int totalECUs=105;
    //         char ECUName[5];
    //         byte fcDIDCAN[3];
    //         byte fcDIDCANFD1st[3];
    //         byte fcDIDCANFD2nd[3];
    //         #include "..\\TestLibraries\\utils.cin"

    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 15,
    //             error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\TestLibraries\\utils.cin"',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

    // test('lintCode detects missing semicolons for LINE STATEMENTS', async () => {
    //     const inputCode =
    //     `variables
    //     {
    //         byte variable1[3]={0x01,0x02,0x03};
    //         byte variable2[3]={0x04,0x05,0x06};
    //         int x = 10;
    //         int y = 20;
    //     }
    //         void MainTest ()
    //     {
    //         int x = 10;
    //         int y = 20;
    //         int z;
    //         z = x + y;
    //         // some comments
    //         if (1){
    //             write("%d",z);
    //             write("%d",w)
    //         }
	//     }`;
    //     const expectedErrors = [
    //         {
    //             line: 17,
    //             error: 'Line statement should end with a semicolon. Statement: - write("%d",w)',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // });

    // test('lintCode detects missing semicolons for Variables declaration (with Comment lines)', async () => {
    //     const inputCode =
    //     `/**
    //     * @var Doxygen comment
    //     * @brief This is a classic Doxygen compliance comment block
    //     */
    //     variables {
    //         byte variable1[3]={0x01,0x02,0x03};
    //         byte variable2[3]={0x04,0x05,0x06}
    //         int x = 10;
    //         int y = 20
    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 7,
    //             error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte variable2[3]={0x04,0x05,0x06}',
    //             priority: 1,
    //             type: "Critical Rule" },
    //         {
    //             line: 9,
    //             error: 'Variable declaration should end with a semicolon. Statement: - int y = 20',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // });

    // test('lintCode detects missing semicolons for Variables declaration (Multi-line case)', async () => {
    //     const inputCode =
    //     `variables
    //     {
    //         byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};
    //         byte EE01_RESPONSE[3]={0x62,0xEE,0x01}
    //         int x = 10;
    //         int y = 20

    //         struct fcDIDLookupTableStr {
    //             char ECUName[5];
    //             byte fcDIDCAN[3];
    //             byte fcDIDCANFD1st[3];
    //             byte fcDIDCANFD2nd[3];
    //         } fcDIDLookupTable[200]
    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 4,
    //             error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte EE01_RESPONSE[3]={0x62,0xEE,0x01}',
    //             priority: 1,
    //             type: "Critical Rule" },
    //         {
    //             line: 6,
    //             error: 'Variable declaration should end with a semicolon. Statement: - int y = 20',
    //             priority: 1,
    //             type: "Critical Rule" },
    //         {
    //             line: 13,
    //             error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - } fcDIDLookupTable[200]',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // });

    // test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION.', async () => {
    //     const inputCode =
    //     `/*@!Encoding:1252*/
    //     includes
    //     {

    //     }

    //     variables {


    //     }

    //     void MainTest ()
    //     {
    //         int x = 10;
    //         int y = 20;
    //         int z;
    //         z = x + y;
    //         // some comments
    //         if (1){
    //         write("%d",z);
    //             int w = 10;
    //             write("%d",w);
    //         }

    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 21,
    //             error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int w = 10;',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

    // test('lindCode detects declaration of local variables not at the beginning portion of the TESTCASE.', async () => {
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

    // testcase myTestCase(byte data, enum ENUMERATION mode)
    // {
    //     byte data1[8];
    //     byte data2[8];
    //     int dataLength;
    //     char text1[100];
    //     char text2[50];

    //     dutData.D1 = data1;
    //     dutData.D2 = data2;
    //     dutData.DL = dataLength;

    //     int x;
    //     strncpy(text1, text2, elcount(text1));

    // }`;
    //     const expectedErrors = [
    //         {
    //             line: 29,
    //             error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int x;',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

    // test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION (Ignoring empty rows).', async () => {
    //     const inputCode =
    //     `/*@!Encoding:1252*/
    //     includes
    //     {

    //     }

    //     variables
    //     {


    //     }

    //     void MainTest ()
    //     {

    //         int x = 10;
    //         int y = 20;
    //         int z;
    //         z = x + y;
    //         // some comments
    //         if (1){
    //         write("%d",z);
    //             int w = 10;
    //             write("%d",w);
    //         }

    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 23,
    //             error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int w = 10;',
    //             priority: 1,
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

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
    //             type: "Critical Rule" }
    //     ];
    //     console.log(expectedErrors);
    //     let evaluatedErrors = await lintCode(inputCode);
    //     console.log(evaluatedErrors);
    //     expect(evaluatedErrors).toEqual(expectedErrors);
    // })

    // test('lindCode detects wrong FUNCTION declaration (function type array).', async () => {
    //     const inputCode =
    //     `/*@!Encoding:1252*/
    //     includes
    //     {

    //     }

    //     variables
    //     {


    //     }

    //     byte[] myFunctionOfTypeArray()
    //     {

    //         int x = 10;
    //         int y = 20;
    //         int z;
    //         z = x + y;
    //         // some comments
    //         if (1){
    //         write("%d",z);
    //             write("%d",w);
    //         }
    //         return [];
    //     }`;
    //     const expectedErrors = [
    //         {
    //             line: 13,
    //             error: 'Function declaration CANNOT be of type ARRAY, use Referenced variables to return array types. Statement: - byte[] myFunctionOfTypeArray()',
    //             priority: 1,
    //             type: "Critical Rule" }
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

describe('Critical Rules Suite', () => {

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
                type: "Critical Rule"
            }
        ];

        console.log(expectedErrors);

        const parser = new Parser();

        // Parse and analyze the code
        const parserHandler = parser.parse(inputCode);
        parserHandler.mainLoop();

        // Collect errors
        const evaluatedErrors = parserHandler.errors;

        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

});


describe('Test case for Token types and Registered Specs', () => {

    test('Types', async () => {
        const inputCode =
        `// Message Definition
        message ExampleMessage {
            byte data[8];
        };
        // Variable Definition
        const int EXAMPLE_CONSTANT = 10;
        var float exampleVariable = 3.14;
        // Function Definition
        on message ExampleMessage {
            print("Received ExampleMessage");
        }
        // Control Structure
        if (condition) {
            print("Condition is true");
        }
        else {
            print("Condition is false");
        }
        // Function Call
        exampleFunction(arg1, arg2);
        // Event Handler
        on start {
            print("Script started");
        }
        // Loop Iteration
        for (int i = 0; i < 10; i++) {
            print("Iteration " + i);
        }
        // Timer Event
        on timer TimerEvent {
            print("Timer event occurred");
        }
        // Message Reception
        on message AnotherMessage {
            print("Received AnotherMessage");
        }
        // Signal Manipulation
        setSignal(SignalName, 100);
        // Environment Variable Handling
        setEnvVar(EnvVarName, "value");`;

        const expectedErrors = [
            {
                identifier: "//",
                original: "// Message Definition",
                text: " Message Definition",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "message ExampleMessage {",
                dataType: "message",
                name: "ExampleMessage",
                openCurly: "{",
                tokenizerKind: 'MESSAGEDEFINITIONBLOCK',
                type: "MessageDefinitionBlock"},
            {
                original: "byte data[8];",
                modifier: undefined,
                dataType: "byte",
                name: "data",
                arraySize: "[8]",
                assigment: undefined,
                value: undefined,
                semicolon: ";",
                tokenizerKind: 'VARIABLEDECLARATION',
                type: "VariableDeclaration"},
            {
                original: "};",
                closeCurly: "}",
                semicolon: ";",
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Variable Definition",
                text: " Variable Definition",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "const int EXAMPLE_CONSTANT = 10;",
                modifier: "const",
                dataType: "int",
                name: "EXAMPLE_CONSTANT",
                arraySize: undefined,
                assigment: "=",
                value: "10",
                semicolon: ";",
                tokenizerKind: 'VARIABLEDECLARATION',
                type: "VariableDeclaration"},
            {
                original: "var float exampleVariable = 3.14;",
                modifier: "var",
                dataType: "float",
                name: "exampleVariable",
                arraySize: undefined,
                assigment: "=",
                value: "3.14",
                semicolon: ";",
                tokenizerKind: 'VARIABLEDECLARATION',
                type: "VariableDeclaration"},
            {
                identifier: "//",
                original: "// Function Definition",
                text: " Function Definition",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "on message ExampleMessage {",
                dataType: "on message",
                name: "ExampleMessage",
                openCurly: "{",
                tokenizerKind: 'MESSAGEEVENTBLOCK',
                type: "MessageEventBlock"},
            {
                original: "print(\"Received ExampleMessage\");",
                name: "print",
                openParen: "(",
                arguments: "\"Received ExampleMessage\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Control Structure",
                text: " Control Structure",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "if (condition) {",
                ifkey: "if",
                openParen: "(",
                conditional: "condition",
                closeParen: ")",
                openCurly: "{",
                tokenizerKind: 'IF',
                type: "ifCall"},
            {
                original: "print(\"Condition is true\");",
                name: "print",
                openParen: "(",
                arguments: "\"Condition is true\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                original: "else {",
                elsekey: "else",
                openCurly: "{",
                tokenizerKind: 'ELSE',
                type: "elseCall"},
            {
                original: "print(\"Condition is false\");",
                name: "print",
                openParen: "(",
                arguments: "\"Condition is false\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Function Call",
                text: " Function Call",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "exampleFunction(arg1, arg2);",
                name: "exampleFunction",
                openParen: "(",
                arguments: "arg1, arg2",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                identifier: "//",
                original: "// Event Handler",
                text: " Event Handler",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "on start {",
                dataType: "on start",
                openCurly: "{",
                tokenizerKind: 'STARTEVENTBLOCK',
                type: "StartEventBlock"},
            {
                original: "print(\"Script started\");",
                name: "print",
                openParen: "(",
                arguments: "\"Script started\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Loop Iteration",
                text: " Loop Iteration",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "for (int i = 0; i < 10; i++) {",
                forkey: "for",
                openParen: "(",
                initializer: "int i = 0; i < 10; i++",
                closeParen: ")",
                openCurly: "{",
                tokenizerKind: 'FORLOOP',
                type: "forLoop"},
            {
                original: "print(\"Iteration \" + i);",
                name: "print",
                openParen: "(",
                arguments: "\"Iteration \" + i",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Timer Event",
                text: " Timer Event",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "on timer TimerEvent {",
                dataType: "on timer",
                name: "TimerEvent",
                openCurly: "{",
                tokenizerKind: 'TIMEREVENTBLOCK',
                type: "TimerEventBlock"},
            {
                original: "print(\"Timer event occurred\");",
                name: "print",
                openParen: "(",
                arguments: "\"Timer event occurred\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Message Reception",
                text: " Message Reception",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "on message AnotherMessage {",
                dataType: "on message",
                name: "AnotherMessage",
                openCurly: "{",
                tokenizerKind: 'MESSAGEEVENTBLOCK',
                type: "MessageEventBlock"},
            {
                original: "print(\"Received AnotherMessage\");",
                name: "print",
                openParen: "(",
                arguments: "\"Received AnotherMessage\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                original: "}",
                closeCurly: "}",
                semicolon: undefined,
                tokenizerKind: 'CLOSINGBLOCK',
                type: "ClosingBlock"},
            {
                identifier: "//",
                original: "// Signal Manipulation",
                text: " Signal Manipulation",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "setSignal(SignalName, 100);",
                name: "setSignal",
                openParen: "(",
                arguments: "SignalName, 100",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"},
            {
                identifier: "//",
                original: "// Environment Variable Handling",
                text: " Environment Variable Handling",
                tokenizerKind: null,
                type: "Comment"},
            {
                original: "setEnvVar(EnvVarName, \"value\");",
                name: "setEnvVar",
                openParen: "(",
                arguments: "EnvVarName, \"value\"",
                closeParen: ")",
                semicolon: ";",
                tokenizerKind: 'FUNCTIONCALL',
                type: "FunctionCall"}
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await identicationTypesTest(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

});