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
                name: ast.name,
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

describe('Parser', () => {
    it('Should parse an if statement', () => {
        const parser = new Parser();
        const code = 'if (x) { return; }';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "IfStatement",
                    condition: {
                        col: 5,
                        row: 1,
                        type: "IDENTIFIER",
                        name: "x",
                        wasDeclared: false,
                        wasUsed: true
                    },
                    body: [
                        {
                            col: 10,
                            row: 1,
                            type: "ReturnStatement",
                            name: null,
                            hasSemicolon: true,
                        }
                    ],
                    elseBody: null,
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse nested if statements', () => {
        const parser = new Parser();
        const code = 'if (x) { if (y) { return; } }';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'IfStatement',
                    condition: {
                        type: 'IDENTIFIER',
                        name: 'x',
                        col: 5,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    body: [
                        {
                            type: 'IfStatement',
                            condition: {
                                type: 'IDENTIFIER',
                                name: 'y',
                                col: 14,
                                row: 1,
                                wasDeclared: false,
                                wasUsed: true
                            },
                            body: [
                                {
                                    type: 'ReturnStatement',
                                    name: null,
                                    col: 19,
                                    row: 1,
                                    hasSemicolon: true,
                                }
                            ],
                            elseBody: null,
                            col: 10,
                            row: 1
                        }
                    ],
                    elseBody: null,
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse a variable initialization with the Member access operator on it for User Defined structs', () => {
        const parser = new Parser();
        const code = `UserStruct.member = 10;`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "StructMemberVariableInitialization",
                    variableName: "UserStruct",
                    memberName: "member",
                    memberValue: {
                        type: "LITERAL_NUMBER",
                        name: "10",
                        col: 21,
                        row: 1
                    },
                    hasSemicolon: true,
                    col: 1,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true
                }
            ]
        });
    });

    it('Should parse a variable initialization with the Member access operator on it for User Defined structs (Assigment to another Struct Member variable)', () => {
        const parser = new Parser();
        const code = 'UserStruct.member = UserStruct2.member2;';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "StructMemberVariableInitialization",
                    variableName: "UserStruct",
                    memberName: "member",
                    memberValue: {
                        type: "StructMemberAccessExpression",
                        variableName: "UserStruct2",
                        memberName: "member2",
                        col: 21,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    hasSemicolon: true,
                    col: 1,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true
                }
            ]
        });
    });

    it('Should parse a return statement with a literal number', () => {
        const parser = new Parser();
        const code = 'return 42;';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'ReturnStatement',
                    col: 1,
                    row: 1,
                    name: {
                        type: 'LITERAL_NUMBER',
                        name: '42',
                        col: 8,
                        row: 1
                    },
                    hasSemicolon: true,
                }
            ]
        });
    });

    it('Should parse multiple statements in a block', () => {
        const parser = new Parser();
        const code = 'if (x) { UserStruct.member = 10; return; }';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'IfStatement',
                    condition: {
                        type: 'IDENTIFIER',
                        name: 'x',
                        col: 5,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    body: [
                        {
                            type: 'StructMemberVariableInitialization',
                            variableName: 'UserStruct',
                            memberName: 'member',
                            memberValue: {
                                type: 'LITERAL_NUMBER',
                                name: '10',
                                col: 30,
                                row: 1
                            },
                            hasSemicolon: true,
                            col: 10,
                            row: 1,
                            wasDeclared: false,
                            wasUsed: true
                        },
                        {
                            type: 'ReturnStatement',
                            name: null,
                            col: 34,
                            row: 1,
                            hasSemicolon: true,
                        }
                    ],
                    elseBody: null,
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    // it('Should throw an error for invalid statement', () => {
    //     const parser = new Parser();
    //     const code = 'unknown { return; }';
    //     const results = parser.parse(code);

    //     assert.deepEqual(normalizeAST(results), {
    //         errors: ["Unexpected block after IDENTIFIER 'unknown'"],
    //         ast: []
    //     });
    // });

    it('Should parse an if-else statement', () => {
        const parser = new Parser();
        const code = 'if (x) { return; } else { return 1; }';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'IfStatement',
                    condition: {
                        type: 'IDENTIFIER',
                        name: 'x',
                        col: 5,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    body: [{
                        type: 'ReturnStatement',
                        name: null,
                        col: 10,
                        row: 1,
                        hasSemicolon: true,
                    }],
                    elseBody: {
                        type: 'ElseStatement',
                        body: [
                            {
                                type: 'ReturnStatement', name:
                                {
                                    type: 'LITERAL_NUMBER',
                                    name: '1',
                                    col: 34,
                                    row: 1
                                },
                                col: 27,
                                row: 1,
                                hasSemicolon: true,
                            }
                        ],
                        col: 20,
                        row: 1
                    },
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse an empty if block', () => {
        const parser = new Parser();
        const code = 'if (x) { }';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'IfStatement',
                    condition: {
                        type: 'IDENTIFIER',
                        name: 'x',
                        col: 5,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    body: [],
                    elseBody: null,
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse compound conditions in if statement', () => {
        const parser = new Parser();
        const code = `if (x && y) { return; }`;
        const results = parser.parse(code);


        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'IfStatement',
                    condition: {
                        left: {
                            col: 5,
                            name: "x",
                            row: 1,
                            type: "IDENTIFIER",
                            wasDeclared: false,
                            wasUsed: true,
                        },
                        operator: "AND",
                        right: {
                            col: 10,
                            name: "y",
                            row: 1,
                            type: "IDENTIFIER",
                            wasDeclared: false,
                            wasUsed: true,
                        },
                        type: "LogicalExpression",
                    },
                    body: [{
                        type: "ReturnStatement",
                        name: null,
                        col: 15,
                        row: 1,
                        hasSemicolon: true,
                    }],
                    elseBody: null,
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse array access and assignment', () => {
        const parser = new Parser();
        const code = 'array[0] = 5;';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "VariableInitialization",
                    variableName: "array",
                    "variableValue": {
                        type: "LITERAL_NUMBER",
                        name: "5",
                        col: 12,
                        row: 1
                    },
                    hasSemicolon: true,
                    col: 1,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true
                }
            ]
        });
    });

    it('Should parse a simple function call', () => {
        const parser = new Parser();
        const code = 'log("hello");';
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: 'FunctionCallExpression',
                    name: 'log',
                    arguments: [
                        {
                            type: 'LITERAL_STRING',
                            name: '"hello"',
                            col: 5,
                            row: 1
                        }
                    ],
                    col: 1,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true,
                    hasSemicolon: true,
                }
            ]
        });
    });

    it('Should process a Function Call with multiple arguments and a Function Call as one of the arguments', () => {
        const parser = new Parser();
        const code = `functionName1(argumentVariable1, argumentVariable2, functionName2(argumentVariable1));`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "FunctionCallExpression",
                    name: "functionName1",
                    arguments: [
                        { col: 15, row: 1, type: "IDENTIFIER", name: "argumentVariable1", wasDeclared: false, wasUsed: true },
                        { col: 34, row: 1, type: "IDENTIFIER", name: "argumentVariable2", wasDeclared: false, wasUsed: true },
                        {
                            type: "FunctionCallExpression",
                            name: "functionName2",
                            arguments: [
                                { col: 67, row: 1, type: "IDENTIFIER", name: "argumentVariable1", wasDeclared: false, wasUsed: true },
                            ],
                            col: 53,
                            row: 1,
                            wasDeclared: false,
                            wasUsed: true,
                            hasSemicolon: false,
                        }
                    ],
                    col: 1,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true,
                    hasSemicolon: true,
                }
            ]
        });
    });

    it('Should parse an INCLUDES block', () => {
        const parser = new Parser();
        const code = String.raw`includes
        {
        // Standard libraries
          #include "..\TestLibraries\constants.cin"
          #include "..\TestLibraries\types.cin"

        }`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "IncludeBlockStatement",
                    value:
                        [
                            {
                                hasHash: true,
                                type: "IncludeStatement",
                                name: "\"..\\TestLibraries\\constants.cin\"",
                            },
                            {
                                hasHash: true,
                                type: "IncludeStatement",
                                name: "\"..\\TestLibraries\\types.cin\"",
                            }
                        ],
                }
            ]
        });
    });

    it('Should parse a VARIABLES block', () => {
        const parser = new Parser();
        const code = String.raw`variables
        {
            dword reqid;
            dword respid;

        }`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    col: 1,
                    row: 1,
                    type: "VariablesBlockStatement",
                    body:
                        [
                            {
                                col: 19,
                                hasSemicolon: true,
                                row: 3,
                                type: "VariableDeclaration",
                                typeName: "DWORD",
                                variableName: "reqid",
                                variableValue: null,
                                wasDeclared: true,
                                wasUsed: false,
                            },
                            {
                                col: 19,
                                hasSemicolon: true,
                                row: 4,
                                type: "VariableDeclaration",
                                typeName: "DWORD",
                                variableName: "respid",
                                variableValue: null,
                                wasDeclared: true,
                                wasUsed: false,
                            },
                        ],
                }
            ]
        });
    });

    it('Should parse a TESTCASE block', () => {
        const parser = new Parser();
        const code = String.raw`testcase testCaseName1(byte argumentByte1, enum ENUM_TYPE argumentEnum1)
        {
            byte localVariable1[8];
            write("Print message");
        }`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    name: "testCaseName1",
                    parameters: [
                        {
                            parameterName: "argumentByte1",
                            type: "ParameterDeclaration",
                            definedType: "BYTE",
                            userDefinedTypeName: null,
                        },
                        {
                            parameterName: "argumentEnum1",
                            type: "ParameterDeclaration",
                            definedType: "ENUM",
                            userDefinedTypeName: "ENUM_TYPE",
                        },
                    ],
                    type: "TestCaseBlockStatement",
                    body: [
                        {
                            type: "VariableDeclaration",
                            typeName: "BYTE",
                            variableName: "localVariable1",
                            variableValue: null,
                            wasDeclared: true,
                            wasUsed: false,
                            col: 18,
                            row: 3,
                            hasSemicolon: true,
                        },
                        {
                            type: "FunctionCallExpression",
                            name: "write",
                            arguments: [
                                {
                                    type: "LITERAL_STRING",
                                    name: "\"Print message\"",
                                    col: 19,
                                    row: 4,
                                },
                            ],
                            wasDeclared: true,
                            wasUsed: true,
                            col: 13,
                            row: 4,
                            hasSemicolon: true,
                        },
                    ],
                    col: 1,
                    row: 1
                }
            ]
        });
    });

    it('Should parse a TESTBLOCK with an complex if conditional', () => {
        const parser = new Parser();
        const code = String.raw`testcase testCaseName1(byte argumentByte1, enum ENUM_TYPE argumentEnum1, enum ENUM_TYPE_2 argumentEnum2, struct STRUCT_TYPE_1 argumentStruct1, int index)
        {
            if (sendDataAndValidate(arg1, arg2, arg3, "StringAsArgument") == FAILURE){return;}
        }`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    name: "testCaseName1",
                    parameters: [
                     {
                        definedType: "BYTE",
                        parameterName: "argumentByte1",
                        type: "ParameterDeclaration",
                        userDefinedTypeName: null,
                      },
                       {
                        definedType: "ENUM",
                        parameterName: "argumentEnum1",
                        type: "ParameterDeclaration",
                        userDefinedTypeName: "ENUM_TYPE",
                      },
                       {
                        definedType: "ENUM",
                        parameterName: "argumentEnum2",
                        type: "ParameterDeclaration",
                        userDefinedTypeName: "ENUM_TYPE_2",
                      },
                       {
                        definedType: "STRUCT",
                        parameterName: "argumentStruct1",
                        type: "ParameterDeclaration",
                        userDefinedTypeName: "STRUCT_TYPE_1",
                      },
                       {
                        definedType: "INT",
                        parameterName: "index",
                        type: "ParameterDeclaration",
                        userDefinedTypeName: null,
                      },
                    ],
                    type: "TestCaseBlockStatement",
                    body:  [
                       {
                        body:  [
                           {
                            col: 87,
                            row: 3,
                            type: "ReturnStatement",
                            name: null,
                            hasSemicolon: true,
                          },
                        ],
                        col: 13,
                        condition:  {
                          left:  {
                            arguments:  [
                               {
                                name: "arg1",
                                type: "IDENTIFIER",
                                row: 3,
                                col: 37,
                                wasDeclared: false,
                                wasUsed: true
                              },
                               {
                                name: "arg2",
                                type: "IDENTIFIER",
                                row: 3,
                                col: 43,
                                wasDeclared: false,
                                wasUsed: true
                              },
                               {
                                name: "arg3",
                                type: "IDENTIFIER",
                                row: 3,
                                col: 49,
                                wasDeclared: false,
                                wasUsed: true
                              },
                               {
                                type: "LITERAL_STRING",
                                name: "\"StringAsArgument\"",
                                row: 3,
                                col: 55,
                              },
                            ],
                            name: "sendDataAndValidate",
                            type: "FunctionCallExpression",
                            row: 3,
                            col: 17,
                            wasDeclared: false,
                            wasUsed: true,
                            hasSemicolon: false,
                          },
                          operator: "OPERATOR_EQUAL",
                          right:  {
                            name: "FAILURE",
                            type: "IDENTIFIER",
                            row: 3,
                            col: 78,
                            wasDeclared: false,
                            wasUsed: true
                          },
                          type: "BINARY_EXPRESSION",
                        },
                        elseBody: null,
                        row: 3,
                        type: "IfStatement",
                      },
                    ],
                    col: 1,
                    row: 1
                      }
            ]
        });
    });

    it('Should parse an IF statement with a complex Binary expression', () => {
        const parser = new Parser();
        const code = String.raw`if (sendDataAndValidate(arg1, arg2, arg3, "StringAsArgument") == FAILURE){return;}`;
        const results = parser.parse(code);

        assert.deepEqual(normalizeAST(results), {
            errors: [],
            ast: [
                {
                    type: "IfStatement",
                    condition: {
                        left: {
                            type: "FunctionCallExpression",
                            name: "sendDataAndValidate",
                            arguments: [
                                {
                                    name: "arg1",
                                    type: "IDENTIFIER",
                                    row: 1,
                                    col: 25,
                                    wasDeclared: false,
                                    wasUsed: true
                                },
                                {
                                    name: "arg2",
                                    type: "IDENTIFIER",
                                    row: 1,
                                    col: 31,
                                    wasDeclared: false,
                                    wasUsed: true
                                },
                                {
                                    name: "arg3",
                                    type: "IDENTIFIER",
                                    row: 1,
                                    col: 37,
                                    wasDeclared: false,
                                    wasUsed: true
                                },
                                {
                                    type: "LITERAL_STRING",
                                    name: "\"StringAsArgument\"",
                                    row: 1,
                                    col: 43,
                                },
                            ],
                            row: 1,
                            col: 5,
                            wasDeclared: false,
                            wasUsed: true,
                            hasSemicolon: false,
                        },
                        operator: "OPERATOR_EQUAL",
                        right: {
                            type: "IDENTIFIER",
                            name: "FAILURE",
                            row: 1,
                            col: 66,
                            wasDeclared: false,
                            wasUsed: true
                        },
                        type: "BINARY_EXPRESSION",
                    },
                    body: [
                        {
                            col: 75,
                            row: 1,
                            type: "ReturnStatement",
                            name: null,
                            hasSemicolon: true,
                        },
                    ],
                    elseBody: null,
                    col: 1,
                    row: 1

                }
            ]
        });
    });
});

// describe('Real Code', () => {



//     it('Should parse compound conditions in if statement', () => {
//         const parser = new Parser();
//         const code = `if (x && y) { return; }`;
//         const results = parser.parse(code);


//         assert.deepEqual(normalizeAST(results), {
//             errors: [],
//             ast: [
//                 {

//                 }
//             ]
//         });
//     });
// });