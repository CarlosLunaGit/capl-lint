// tests/parser.test.js
import Parser from '../../src/parser/parser';
const assert = require('assert');

function normalizeAST(ast) {
    if (Array.isArray(ast)) {
        return ast.map(normalizeAST);
    }
    if (ast && typeof ast === 'object') {
        if (ast.constructor.name === 'Token') {
            return {
                type: ast.type,
                value: ast.value,
                row: ast.row,
                col: ast.col
            };
        }

        const result = {};
        for (const [key, value] of Object.entries(ast)) {
            result[key] = normalizeAST(value);
        }
        return result;
    }
    return ast;
}

// describe('Parser', () => {
//     it('Should parse an if statement', () => {
//         const parser = new Parser();
//         const code = 'if (x) { return; }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "IfStatement",
//                     condition: {
//                         col: 5,
//                         row: 1,
//                         type: "IDENTIFIER",
//                         value: "x",
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     body: [
//                         {
//                             col: 10,
//                             row: 1,
//                             type: "ReturnStatement",
//                             value: null
//                         }
//                     ],
//                     elseBody: null,
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should parse nested if statements', () => {
//         const parser = new Parser();
//         const code = 'if (x) { if (y) { return; } }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'IfStatement',
//                     condition: {
//                         type: 'IDENTIFIER',
//                         value: 'x',
//                         col: 5,
//                         row: 1,
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     body: [
//                         {
//                             type: 'IfStatement',
//                             condition: {
//                                 type: 'IDENTIFIER',
//                                 value: 'y',
//                                 col: 14,
//                                 row: 1,
//                                 wasDeclared: false,
//                                 wasUsed: true
//                             },
//                             body: [
//                                 {
//                                     type: 'ReturnStatement',
//                                     value: null,
//                                     col: 19,
//                                     row: 1
//                                 }
//                             ],
//                             elseBody: null,
//                             col: 10,
//                             row: 1
//                         }
//                     ],
//                     elseBody: null,
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should parse a variable initialization with the Member access operator on it for User Defined structs', () => {
//         const parser = new Parser();
//         const code = `UserStruct.member = 10;`;
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "StructMemberVariableInitialization",
//                     variableName: "UserStruct",
//                     memberName: "member",
//                     memberValue: {
//                         type: "LITERAL_NUMBER",
//                         value: "10",
//                         col: 21,
//                         row: 1
//                     },
//                     hasSemicolon: true,
//                     col: 1,
//                     row: 1,
//                     wasDeclared: false,
//                     wasUsed: true
//                 }
//             ]
//         });
//     });

//     it('Should parse a variable initialization with the Member access operator on it for User Defined structs (Assigment to another Struct Member variable)', () => {
//         const parser = new Parser();
//         const code = 'UserStruct.member = UserStruct2.member2;';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "StructMemberVariableInitialization",
//                     variableName: "UserStruct",
//                     memberName: "member",
//                     memberValue: {
//                         type: "StructMemberAccessExpression",
//                         variableName: "UserStruct2",
//                         memberName: "member2",
//                         col: 21,
//                         row: 1,
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     hasSemicolon: true,
//                     col: 1,
//                     row: 1,
//                     wasDeclared: false,
//                     wasUsed: true
//                 }
//             ]
//         });
//     });

//     it('Should parse a return statement with a literal number', () => {
//         const parser = new Parser();
//         const code = 'return 42;';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'ReturnStatement',
//                     col: 1,
//                     row: 1,
//                     value: {
//                         type: 'LITERAL_NUMBER',
//                         value: '42',
//                         col: 8,
//                         row: 1
//                     }
//                 }
//             ]
//         });
//     });

//     it('Should parse multiple statements in a block', () => {
//         const parser = new Parser();
//         const code = 'if (x) { UserStruct.member = 10; return; }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'IfStatement',
//                     condition: {
//                         type: 'IDENTIFIER',
//                         value: 'x',
//                         col: 5,
//                         row: 1,
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     body: [
//                         {
//                             type: 'StructMemberVariableInitialization',
//                             variableName: 'UserStruct',
//                             memberName: 'member',
//                             memberValue: {
//                                 type: 'LITERAL_NUMBER',
//                                 value: '10',
//                                 col: 30,
//                                 row: 1
//                             },
//                             hasSemicolon: true,
//                             col: 10,
//                             row: 1,
//                             wasDeclared: false,
//                             wasUsed: true
//                         },
//                         {
//                             type: 'ReturnStatement',
//                             value: null,
//                             col: 34,
//                             row: 1
//                         }
//                     ],
//                     elseBody: null,
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should throw an error for invalid statement', () => {
//         const parser = new Parser();
//         const code = 'unknown { return; }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: ["Unexpected block after identifier 'unknown'"],
//             ast: []
//         });
//     });

//     it('Should parse an if-else statement', () => {
//         const parser = new Parser();
//         const code = 'if (x) { return; } else { return 1; }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'IfStatement',
//                     condition: {
//                         type: 'IDENTIFIER',
//                         value: 'x',
//                         col: 5,
//                         row: 1,
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     body: [{
//                         type: 'ReturnStatement',
//                         value: null,
//                         col: 10,
//                         row: 1
//                     }],
//                     elseBody: {
//                         type: 'ElseStatement',
//                         body: [
//                             {
//                                 type: 'ReturnStatement', value:
//                                 {
//                                     type: 'LITERAL_NUMBER',
//                                     value: '1',
//                                     col: 34,
//                                     row: 1
//                                 },
//                                 col: 27,
//                                 row: 1
//                             }
//                         ],
//                         col: 20,
//                         row: 1
//                     },
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should parse an empty if block', () => {
//         const parser = new Parser();
//         const code = 'if (x) { }';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'IfStatement',
//                     condition: {
//                         type: 'IDENTIFIER',
//                         value: 'x',
//                         col: 5,
//                         row: 1,
//                         wasDeclared: false,
//                         wasUsed: true
//                     },
//                     body: [],
//                     elseBody: null,
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should parse compound conditions in if statement', () => {
//         const parser = new Parser();
//         const code = `if (x && y) { return; }`;
//         const results = parser.parse(code);


//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'IfStatement',
//                     condition: {
//                         logicalOperator: "AND",
//                         type: "ConditionalStatement",
//                         variableNameLeft: "x",
//                         variableNameRight: "y",
//                         col: 7,
//                         row: 1,
//                         wasDeclaredLeft: false,
//                         wasUsedLeft: true,
//                         wasDeclaredRight: false,
//                         wasUsedRight: true
//                     },
//                     body: [{
//                         type: "ReturnStatement",
//                         value: null,
//                         col: 15,
//                         row: 1
//                     }],
//                     elseBody: null,
//                     col: 1,
//                     row: 1
//                 }
//             ]
//         });
//     });

//     it('Should parse array access and assignment', () => {
//         const parser = new Parser();
//         const code = 'array[0] = 5;';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "VariableInitialization",
//                     variableName: "array",
//                     "variableValue": {
//                         type: "LITERAL_NUMBER",
//                         value: "5",
//                         col: 12,
//                         row: 1
//                     },
//                     hasSemicolon: true,
//                     col: 1,
//                     row: 1,
//                     wasDeclared: false,
//                     wasUsed: true
//                 }
//             ]
//         });
//     });

//     it('Should parse a simple function call', () => {
//         const parser = new Parser();
//         const code = 'log("hello");';
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: 'FunctionCall',
//                     functionName: 'log',
//                     arguments: [
//                         {
//                             type: 'LITERAL_STRING',
//                             value: '"hello"',
//                             col: 5,
//                             row: 1
//                         }
//                     ],
//                     col: 1,
//                     row: 1,
//                     wasDeclared: false,
//                     wasUsed: true
//                 }
//             ]
//         });
//     });

//     it('Should process a Function Call with multiple arguments and a Function Call as one of the arguments', () => {
//         const parser = new Parser();
//         const code = `functionName1(argumentVariable1, argumentVariable2, functionName2(argumentVariable1));`;
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "FunctionCall",
//                     functionName: "functionName1",
//                     arguments: [
//                         { col: 15, row: 1, type: "IDENTIFIER", value: "argumentVariable1", wasDeclared: false, wasUsed: true },
//                         { col: 34, row: 1, type: "IDENTIFIER", value: "argumentVariable2", wasDeclared: false, wasUsed: true },
//                         {
//                             type: "FunctionCall",
//                             functionName: "functionName2",
//                             arguments: [
//                                 { col: 67, row: 1, type: "IDENTIFIER", value: "argumentVariable1", wasDeclared: false, wasUsed: true },
//                             ],
//                             col: 53,
//                             row: 1,
//                             wasDeclared: false,
//                             wasUsed: true
//                         }
//                     ],
//                     col: 1,
//                     row: 1,
//                     wasDeclared: false,
//                     wasUsed: true
//                 }
//             ]
//         });
//     });

//     it('Should parse an INCLUDES block', () => {
//         const parser = new Parser();
//         const code = String.raw`includes
//         {
//         // Standard libraries
//           #include "..\TestLibraries\constants.cin"
//           #include "..\TestLibraries\types.cin"

//         }`;
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     type: "IncludeBlockStatement",
//                     value:
//                         [
//                             {
//                                 hasHash: true,
//                                 type: "IncludeStatement",
//                                 value: "\"..\\TestLibraries\\constants.cin\"",
//                             },
//                             {
//                                 hasHash: true,
//                                 type: "IncludeStatement",
//                                 value: "\"..\\TestLibraries\\types.cin\"",
//                             }
//                         ],
//                 }
//             ]
//         });
//     });

//     it('Should parse a VARIABLES block', () => {
//         const parser = new Parser();
//         const code = String.raw`variables
//         {
//             dword reqid;
//             dword respid;

//         }`;
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     col: 1,
//                     row: 1,
//                     type: "VariablesBlockStatement",
//                     value:
//                         [
//                             {
//                                 col: 19,
//                                 hasSemicolon: true,
//                                 row: 3,
//                                 type: "VariableDeclaration",
//                                 typeName: "DWORD",
//                                 variableName: "reqid",
//                                 variableValue: null,
//                                 wasDeclared: true,
//                                 wasUsed: false,
//                             },
//                             {
//                                 col: 19,
//                                 hasSemicolon: true,
//                                 row: 4,
//                                 type: "VariableDeclaration",
//                                 typeName: "DWORD",
//                                 variableName: "respid",
//                                 variableValue: null,
//                                 wasDeclared: true,
//                                 wasUsed: false,
//                             },
//                         ],
//                 }
//             ]
//         });
//     });

//     it('Should parse a TESTCASE block', () => {
//         const parser = new Parser();
//         const code = String.raw`testcase testCaseName1(byte argumentByte1, enum ENUM_TYPE argumentEnum1)
//         {
//             byte localVariable1[8];
//             write("Print message");
//         }`;
//         const results = parser.parse(code);

//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {
//                     testCaseName: "testCaseName1",
//                     testCaseParameters: [
//                         {
//                             parameterName: "argumentByte1",
//                             type: "ParameterDeclaration",
//                             definedType: "BYTE",
//                             userDefinedTypeName: null,
//                         },
//                         {
//                             parameterName: "argumentEnum1",
//                             type: "ParameterDeclaration",
//                             definedType: "ENUM",
//                             userDefinedTypeName: "ENUM_TYPE",
//                         },
//                     ],
//                     type: "TestCaseBlockStatement",
//                     value: [
//                         {
//                             type: "VariableDeclaration",
//                             typeName: "BYTE",
//                             variableName: "localVariable1",
//                             variableValue: null,
//                             wasDeclared: true,
//                             wasUsed: false,
//                             col: 18,
//                             row: 3,
//                             hasSemicolon: true,
//                         },
//                         {
//                             type: "FunctionCall",
//                             functionName: "write",
//                             arguments: [
//                                 {
//                                     type: "LITERAL_STRING",
//                                     value: "\"Print message\"",
//                                     col: 19,
//                                     row: 4,
//                                 },
//                             ],
//                             wasDeclared: false,
//                             wasUsed: true,
//                             col: 13,
//                             row: 4
//                         },
//                     ],
//                 }
//             ]
//         });
//     });
// });

describe('Real Code', () => {

    it('Should process a real Case Scenario', () => {
            const parser = new Parser();
            const code = String.raw`/*@!Encoding:65001*/
/**
 * @file testCase01BlockSizeValueHandlingCANGroup.cin
 * @brief Collection of related test cases forming a test group.
 *
 * This file organizes a set of related test cases into a logical group. The test group defines the
 * sequence and dependencies between individual test cases and is responsible for their collective
 * execution. It acts as a submodule within a test module, grouping test cases by functionality or
 * testing area.
 *
 * Test Groups (LVL2)
 */
includes
{
// Standard libraries
  #include "..\TestLibraries\constants.cin"
  #include "..\TestLibraries\types.cin"

}

variables
{
    dword reqid;
    dword respid;

}

testcase testCase01BlockSizeValueHandlingCANGroup(byte session_ind, enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)
{
    byte payload[8];
    byte validation[8]; //TODO: Add a distingtion between VariableDeclaration and a new type called VariableArrayDeclaration
    int dataLength;
    char out[100]
    char textDeviceUnderTest[50];
    dword respid;

    dutData.FC_WAIT_DELAY = data.FC_WAIT_DELAY;
    dutData.FC_DELAY = data.FC_DELAY;
    dutData.BS = data.BS;
    dutData.STmin = data.STmin;
    // int x;
    strncpy(textDeviceUnderTest, "Device under test: ", 20);

    strncat(textDeviceUnderTest, deviceUnderTest, elcount(textDeviceUnderTest));
    write("-Device under test: %s", textDeviceUnderTest);

    getFlowControlDID(deviceUnderTest, payload, busType, session_ind, dataLength);
    getFlowControlValidation(deviceUnderTest, validation, busType, session_ind, dataLength);

    setupTestCase(session_ind, mode, data.NAME, data.ID, header, textDeviceUnderTest, deviceUnderTest);

    setAddressing(mode, index);
    testWaitForTimeout(5000);

    InitAndPopulateTestTable(data.TC_DESC);

    byteArrayToString(payload, out);

    // testStep("1.1","Precon.ECU configuration and session handling");
    // if (sendDataAndValidate(SESSION_CONTROL_REQUEST, SESSION_CONTROL_RESPONSE, SUCCESS, "1.1") == FAILURE){return;}
    // testWaitForTimeout(2500);

    // testStep("1.2","Read active diagnostic session");
    // if (sendDataAndValidate(ACTIVE_SESSION_REQUEST, ACTIVE_SESSION_RESPONSE, SUCCESS, "1.2") == FAILURE){return;}

    // testStep("1.3","Sending DID with response size > than protocol treshold for Flow Control");
    // blockSizeValueHandling(
    //     connHandle,
    //     data,
    //     data.BS_1,
    //     data.STmin_1,
    //     payload,
    //     dataLength,
    //     validation,
    //     SUCCESS,
    //     "1.3");

    // testStep("1.4","Read active diagnostic session");
    // if (sendDataAndValidate(ACTIVE_SESSION_REQUEST, ACTIVE_SESSION_RESPONSE, SUCCESS, "1.4") == FAILURE){return;}

    // closeTestCaseGroup("1.5", "PostCon.ECU configuration and session handling", "Request", FUNCTIONAL_RESET_REQUEST);

    testWaitForTimeout(1000);

}

`;
            const results = parser.parse(code);

            assert.deepEqual(normalizeAST(results), {
                errors: [],
                ast: [
                    {

                    }
                ]});
          });
  });