// tests/ruleHandler.test.js
import { ScopeManager } from '../../src/utils/scopeManager.js';
import RuleHandler from '../../src/parser/rules/ruleHandler';
import CheckUnusedVariables from '../../src/parser/rules/checkUnusedVariables.js';
import CheckMissingSemicolon from '../../src/parser/rules/checkMissingSemicolon';

const assert = require('assert');

describe('RuleHandler', () => {
  it('should detect unused variable', () => {
    const ruleHandler = new RuleHandler();
    const checkUnusedVariables = new CheckUnusedVariables();
    ruleHandler.addRule(checkUnusedVariables);

    let parserMock = {
        declaredVariables : new Map(),
        scopeManager : new ScopeManager()
    }

    let mockToken = { type: 'VariableDeclaration', name: 'x', row: 1, col: 1 }

    parserMock.scopeManager.enterScope();

    parserMock.scopeManager.declare('x', mockToken);

    parserMock.scopeManager.exitScope();

    const parsedCode = {
        ast:[ mockToken ]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, [
      { type: 'Warning', message: "Variable 'x' is DECLARED but never USED.", row: 1, col: 1 }
    ]);
  });

  it('should not detect an error when variable is used', () => {
    const ruleHandler = new RuleHandler();
    const checkUnusedVariables = new CheckUnusedVariables();
    ruleHandler.addRule(checkUnusedVariables);

    let parserMock = {
        declaredVariables : new Map(),
        scopeManager : new ScopeManager()
    }

    let mockToken = { type: 'VariableDeclaration', name: 'x', row: 1, col: 1 }

    parserMock.scopeManager.enterScope();

    parserMock.scopeManager.declare('x', mockToken);

    parserMock.scopeManager.use('x');

    parserMock.scopeManager.exitScope();

    const parsedCode = {
        ast:[ mockToken ]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, []);
  });

  it('should detect missing semicolon', () => {
    const ruleHandler = new RuleHandler();
    const checkMissingSemicolon = new CheckMissingSemicolon();
    ruleHandler.addRule(checkMissingSemicolon);

    let parserMock = {
        scopeManager : new ScopeManager()
    }

    let mockToken = { type: 'VariableDeclaration', name: 'x', row: 1, col: 1 }

    parserMock.scopeManager.enterScope();

    parserMock.scopeManager.declare('x', mockToken);

    parserMock.scopeManager.exitScope();

    const parsedCode = {
        ast:[ mockToken ]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, [
      { type: 'Error', message: "Missing semicolon at the end of 'VariableDeclaration': x", row: 1, col: 1 }
    ]);
  });
});
