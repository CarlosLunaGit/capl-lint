// tests/ruleHandler.test.js
import RuleHandler from '../../src/parser/rules/ruleHandler';
import UnusedVariableRule from '../../src/parser/rules/unusedVariableRule';
import CheckMissingSemicolon from '../../src/parser/rules/checkMissingSemicolon';

const assert = require('assert');

describe('RuleHandler', () => {
  it('should detect unused variable', () => {
    const ruleHandler = new RuleHandler();
    const unusedVariableRule = new UnusedVariableRule();
    ruleHandler.addRule(unusedVariableRule);

    let parserMock = {
        declaredVariables : new Map()
    }

    parserMock.declaredVariables.set('x', {
        type: 'VariableDeclaration',
        wasDeclared: true,
        wasUsed: false
    });

    const parsedCode = {
        ast:[ { type: 'VariableDeclaration', variableName: 'x', wasUsed: false }]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, [
      { type: 'Warning', message: 'Unused variable: x' }
    ]);
  });

  it('should not detect an error when variable is used', () => {
    const ruleHandler = new RuleHandler();
    const unusedVariableRule = new UnusedVariableRule();
    ruleHandler.addRule(unusedVariableRule);

    let parserMock = {
        declaredVariables : new Map()
    }

    parserMock.declaredVariables.set('x', {
        type: 'VariableDeclaration',
        wasDeclared: true,
        wasUsed: true
    });

    const parsedCode = {
        ast:[ { type: 'VariableDeclaration', variableName: 'x', wasUsed: true }]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, []);
  });

  it('should detect missing semicolon', () => {
    const ruleHandler = new RuleHandler();
    const checkMissingSemicolon = new CheckMissingSemicolon();
    ruleHandler.addRule(checkMissingSemicolon);

    let parserMock = {
        declaredVariables : new Map()
    }

    parserMock.declaredVariables.set('x', {
        type: 'VariableDeclaration',
        wasDeclared: true,
        wasUsed: true
    });

    const parsedCode = {
        ast:[ { type: 'VariableDeclaration', variableName: 'x', wasUsed: true, row: 2, col: 12 }]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, [
      { type: 'Error', message: "Missing semicolon at the end of 'VariableDeclaration'", row: 2, col: 12 }
    ]);
  });
});
