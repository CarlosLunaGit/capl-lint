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
                    value: "x",
                    wasDeclared: false,
                    wasUsed: true },
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
                    value: 'x',
                    col: 5,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true },
                body: [
                    {
                        type: 'IfStatement',
                        condition: {
                            type: 'IDENTIFIER',
                            value: 'y',
                            col: 14,
                            row: 1,
                            wasDeclared: false,
                            wasUsed: true },
                        body: [
                            {
                                type: 'ReturnStatement',
                                value: null,
                                col: 19,
                                row: 1 }
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
        ]});
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
                    value: "10",
                    col: 21,
                    row: 1 },
                hasSemicolon: true,
                col: 1,
                row: 1,
                wasDeclared: false,
                wasUsed: true
            }
        ]});
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
        ]});
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
                value: {
                    type: 'LITERAL_NUMBER',
                    value: '42',
                    col: 8,
                    row: 1 }
            }
        ]});
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
                    value: 'x',
                    col: 5,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true },
                body: [
                    {
                        type: 'StructMemberVariableInitialization',
                        variableName: 'UserStruct',
                        memberName: 'member',
                        memberValue: {
                            type: 'LITERAL_NUMBER',
                            value: '10',
                            col: 30,
                            row: 1 },
                        hasSemicolon: true,
                        col: 10,
                        row: 1,
                        wasDeclared: false,
                        wasUsed: true
                    },
                    {
                        type: 'ReturnStatement',
                        value: null,
                        col: 34,
                        row: 1
                    }
                ],
                elseBody: null,
                col: 1,
                row: 1
            }
        ]});
  });

  it('Should throw an error for invalid statement', () => {
    const parser = new Parser();
    const code = 'unknown { return; }';
    const results = parser.parse(code);

    assert.deepEqual(normalizeAST(results), {
        errors: ["Unexpected block after identifier 'unknown'"],
        ast: []});
  });

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
                    value: 'x',
                    col: 5,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true },
                body: [{
                    type: 'ReturnStatement',
                    value: null,
                    col: 10,
                    row: 1 }],
                elseBody: {
                    type: 'ElseStatement',
                    body: [
                        {
                            type: 'ReturnStatement', value:
                            {
                                type: 'LITERAL_NUMBER',
                                value: '1',
                                col: 34,
                                row: 1 },
                            col: 27,
                            row: 1
                        }
                    ],
                    col: 20,
                    row: 1
                },
                col: 1,
                row: 1
            }
        ]});
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
                    value: 'x',
                    col: 5,
                    row: 1,
                    wasDeclared: false,
                    wasUsed: true },
                body: [],
                elseBody: null,
                col: 1,
                row: 1
            }
        ]});
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
                    logicalOperator: "AND",
                    type: "ConditionalStatement",
                    variableNameLeft: "x",
                    variableNameRight: "y",
                    col: 7,
                    row: 1,
                    wasDeclaredLeft: false,
                    wasUsedLeft: true,
                    wasDeclaredRight: false,
                    wasUsedRight: true},
                body: [{
                    type: "ReturnStatement",
                    value: null,
                    col: 15,
                    row: 1}],
                elseBody: null,
                col: 1,
                row: 1
            }
        ]});
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
                    value: "5",
                    col: 12,
                    row: 1 },
                hasSemicolon: true,
                col: 1,
                row: 1,
                wasDeclared: false,
                wasUsed: true
            }
        ]});
  });

  it('Should parse a simple function call', () => {
    const parser = new Parser();
    const code = 'log("hello");';
    const results = parser.parse(code);

    assert.deepEqual(normalizeAST(results), {
        errors: [],
        ast: [
            {
                type: 'FunctionCall',
                functionName: 'log',
                arguments: [
                    {
                        type: 'LITERAL_STRING',
                        value: '"hello"',
                        col: 5,
                        row: 1 }
                ],
                col: 1,
                row: 1,
                wasDeclared: false,
                wasUsed: true
            }
        ]});
  });


});
