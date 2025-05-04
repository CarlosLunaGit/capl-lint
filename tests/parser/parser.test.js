// tests/parser.test.js
import Parser from '../../src/parser/parser';
const assert = require('assert');

describe('Parser', () => {
  it('Should parse an if statement', () => {
    const parser = new Parser();
    const code = 'if (x) { return; }';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
      {
        "type": "IfStatement",
        "condition": { "type": "IDENTIFIER", "value": "x" },
        "body": [
            { "type": "ReturnStatement", "value": null }
        ]
    }
    ]);
  });

  it('Should parse nested if statements', () => {
    const parser = new Parser();
    const code = 'if (x) { if (y) { return; } }';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
      {
        type: 'IfStatement',
        condition: { type: 'IDENTIFIER', value: 'x' },
        body: [
          {
            type: 'IfStatement',
            condition: { type: 'IDENTIFIER', value: 'y' },
            body: [
              { type: 'ReturnStatement', value: null }
            ]
          }
        ]
      }
    ]);
  });

  it('Should parse a variable initialization with the Member access operator on it for User Defined structs', () => {
    const parser = new Parser();
    const code = 'UserStruct.member = 10;';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
        {
          "type": "StructMemberVariableDeclaration",
          "variableName": "UserStruct",
          "memberName": "member",
          "memberValue": { "type": "LITERAL_NUMBER", "value": "10" },
          "hasSemicolon": true
      }
      ]);
  });

  it('Should parse a variable initialization with the Member access operator on it for User Defined structs (Assigment to another Struct Member variable)', () => {
    const parser = new Parser();
    const code = 'UserStruct.member = UserStruct2.member2;';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
        {
          "type": "StructMemberVariableDeclaration",
          "variableName": "UserStruct",
          "memberName": "member",
          "memberValue": {
            "type": "StructMemberVariableDeclaration",
            "variableName": "UserStruct2",
            "memberName": "member2",
            "memberValue": null,
            "hasSemicolon": false
          },
          "hasSemicolon": true
        }
      ]);
  });

  it('Should parse a return statement with a literal number', () => {
    const parser = new Parser();
    const code = 'return 42;';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
      {
        type: 'ReturnStatement',
        value: { type: 'LITERAL_NUMBER', value: '42' }
      }
    ]);
  });


  it('Should parse multiple statements in a block', () => {
    const parser = new Parser();
    const code = 'if (x) { UserStruct.member = 10; return; }';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
      {
        type: 'IfStatement',
        condition: { type: 'IDENTIFIER', value: 'x' },
        body: [
          {
            type: 'StructMemberVariableDeclaration',
            variableName: 'UserStruct',
            memberName: 'member',
            memberValue: { type: 'LITERAL_NUMBER', value: '10' },
            hasSemicolon: true
          },
          {
            type: 'ReturnStatement',
            value: null
          }
        ]
      }
    ]);
  });

  it('Should throw an error for invalid statement', () => {
    const parser = new Parser();
    const code = 'unknown { return; }';

    assert.throws(() => {
      parser.parse(code);
    }, /Unexpected statement type/);
  });

  it('Should parse an if-else statement', () => {
    const parser = new Parser();
    const code = 'if (x) { return; } else { return 1; }';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [{
      type: 'IfStatement',
      condition: { type: 'IDENTIFIER', value: 'x' },
      body: [{ type: 'ReturnStatement', value: null }],
      elseBody: { type: 'ElseStatement', body: [
        { type: 'ReturnStatement', value: { type: 'LITERAL_NUMBER', value: '1' } }
        ]}
    }]);
  });

  it('Should parse an empty if block', () => {
    const parser = new Parser();
    const code = 'if (x) { }';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [{
      type: 'IfStatement',
      condition: { type: 'IDENTIFIER', value: 'x' },
      body: []
    }]);
  });

  it('Should parse compound conditions in if statement', () => {
    const parser = new Parser();
    const code = 'if (x && y) { return; }';
    const ast = parser.parse(code);


    assert.deepEqual(ast, [{
        type: 'IfStatement',
        condition: {logicalOperator: "AND", type: "ConditionalStatement", variableNameLeft: "x", variableNameRight: "y"},
        body: [{"type": "ReturnStatement", "value": null}]
      }]);
  });

  it('Should parse array access and assignment', () => {
    const parser = new Parser();
    const code = 'array[0] = 5;';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
        {
          "type": "VariableInitialization",
          "variableName": "array",
          "variableValue": { "type": "LITERAL_NUMBER", "value": "5" },
          "hasSemicolon": true
      }
      ]);
  });

  it('Should parse a simple function call', () => {
    const parser = new Parser();
    const code = 'log("hello");';
    const ast = parser.parse(code);

    assert.deepEqual(ast, [
      {
        type: 'FunctionCall',
        functionName: 'log',
        arguments: [
          { type: 'LITERAL_STRING', value: '"hello"' }
        ]
      }
    ]);
  });





});
