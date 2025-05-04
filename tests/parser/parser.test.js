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
                    value: "x" },
                body: [
                    {
                        col: 10,
                        row: 1,
                        type: "ReturnStatement",
                        value: null }
                ],
                elseBody: null,
                col: 1,
                row: 1
            }
        ]});
  });

//   it('Should parse nested if statements', () => {
//     const parser = new Parser();
//     const code = 'if (x) { if (y) { return; } }';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'IfStatement',
//                 condition: { type: 'IDENTIFIER', value: 'x' },
//                 body: [
//                     {
//                         type: 'IfStatement',
//                         condition: { type: 'IDENTIFIER', value: 'y' },
//                         body: [
//                             { type: 'ReturnStatement', value: null }
//                         ],
//                         elseBody: null
//                     }
//                 ],
//                 elseBody: null
//             }
//         ]});
//   });

//   it('Should parse a variable initialization with the Member access operator on it for User Defined structs', () => {
//     const parser = new Parser();
//     const code = 'UserStruct.member = 10;';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: "StructMemberVariableDeclaration",
//                 variableName: "UserStruct",
//                 memberName: "member",
//                 memberValue: { type: "LITERAL_NUMBER", value: "10" },
//                 hasSemicolon: true
//             }
//         ]});
//   });

//   it('Should parse a variable initialization with the Member access operator on it for User Defined structs (Assigment to another Struct Member variable)', () => {
//     const parser = new Parser();
//     const code = 'UserStruct.member = UserStruct2.member2;';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: "StructMemberVariableDeclaration",
//                 variableName: "UserStruct",
//                 memberName: "member",
//                 memberValue: {
//                     type: "StructMemberAccessExpression",
//                     variableName: "UserStruct2",
//                     memberName: "member2",
//                 },
//                 hasSemicolon: true
//             }
//         ]});
//   });

//   it('Should parse a return statement with a literal number', () => {
//     const parser = new Parser();
//     const code = 'return 42;';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'ReturnStatement',
//                 value: { type: 'LITERAL_NUMBER', value: '42' }
//             }
//         ]});
//   });


//   it('Should parse multiple statements in a block', () => {
//     const parser = new Parser();
//     const code = 'if (x) { UserStruct.member = 10; return; }';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'IfStatement',
//                 condition: { type: 'IDENTIFIER', value: 'x' },
//                 body: [
//                     {
//                         type: 'StructMemberVariableDeclaration',
//                         variableName: 'UserStruct',
//                         memberName: 'member',
//                         memberValue: { type: 'LITERAL_NUMBER', value: '10' },
//                         hasSemicolon: true
//                     },
//                     {
//                         type: 'ReturnStatement',
//                         value: null
//                     }
//                 ],
//                 elseBody: null,
//             }
//         ]});
//   });

//   it('Should throw an error for invalid statement', () => {
//     const parser = new Parser();
//     const code = 'unknown { return; }';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: ["Unexpected block after identifier 'unknown'"],
//         ast: []});
//   });

//   it('Should parse an if-else statement', () => {
//     const parser = new Parser();
//     const code = 'if (x) { return; } else { return 1; }';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'IfStatement',
//                 condition: { type: 'IDENTIFIER', value: 'x' },
//                 body: [{ type: 'ReturnStatement', value: null }],
//                 elseBody: { type: 'ElseStatement', body: [
//                         {
//                             type: 'ReturnStatement', value:
//                             { type: 'LITERAL_NUMBER', value: '1' }
//                         }
//                     ]
//                 }
//             }
//         ]});
//   });

//   it('Should parse an empty if block', () => {
//     const parser = new Parser();
//     const code = 'if (x) { }';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'IfStatement',
//                 condition: { type: 'IDENTIFIER', value: 'x' },
//                 body: [],
//                 elseBody: null
//             }
//         ]});
//   });

//   it('Should parse compound conditions in if statement', () => {
//     const parser = new Parser();
//     const code = 'if (x && y) { return; }';
//     const results = parser.parse(code);


//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'IfStatement',
//                 condition: {logicalOperator: "AND", type: "ConditionalStatement", variableNameLeft: "x", variableNameRight: "y"},
//                 body: [{type: "ReturnStatement", value: null}],
//                 elseBody: null
//             }
//         ]});
//   });

//   it('Should parse array access and assignment', () => {
//     const parser = new Parser();
//     const code = 'array[0] = 5;';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: "VariableInitialization",
//                 variableName: "array",
//                 "variableValue": { type: "LITERAL_NUMBER", value: "5" },
//                 hasSemicolon: true
//             }
//         ]});
//   });

//   it('Should parse a simple function call', () => {
//     const parser = new Parser();
//     const code = 'log("hello");';
//     const results = parser.parse(code);

//     assert.deepEqual(results, {
//         errors: [],
//         ast: [
//             {
//                 type: 'FunctionCall',
//                 functionName: 'log',
//                 arguments: [
//                 { type: 'LITERAL_STRING', value: '"hello"' }
//                 ]
//             }
//         ]});
//   });





});
