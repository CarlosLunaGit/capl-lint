// tests/ruleHandler.test.js
import { ScopeManager } from '../../src/utils/scopeManager.js';
import RuleHandler from '../../src/parser/rules/ruleHandler';
import CheckUnusedVariables from '../../src/parser/rules/checkUnusedVariables.js';
import CheckMissingSemicolon from '../../src/parser/rules/checkMissingSemicolon';
import CheckFunctionUnsupportedTypes from '../../src/parser/rules/checkFunctionUnsupportedTypes.js';

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

    let mockToken = { type: 'VariableDeclaration', name: 'x', row: 1, col: 1, partialDeclaration: false }

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

  it('should not detect a WARNING when a properly declared variable is used', () => {
    const ruleHandler = new RuleHandler();
    const checkUnusedVariables = new CheckUnusedVariables();
    ruleHandler.addRule(checkUnusedVariables);

    let parserMock = {
        declaredVariables : new Map(),
        scopeManager : new ScopeManager()
    }

    let mockToken = { type: 'VariableDeclaration', name: 'x', row: 1, col: 1, partialDeclaration: false }

    parserMock.scopeManager.enterScope();

    parserMock.scopeManager.declare('x', mockToken);

    parserMock.scopeManager.currentScope.declareUse('x', mockToken);

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

  it('Linter detects wrong FUNCTION declaration (function type array).', () => {
    const ruleHandler = new RuleHandler();
    const checkFunctionUnsupportedTypes = new CheckFunctionUnsupportedTypes();
    ruleHandler.addRule(checkFunctionUnsupportedTypes);

    let parserMock = {
        scopeManager : new ScopeManager()
    }

    let mockToken = { type: 'FunctionDeclaration', name: 'Function1', row: 6, col: 9, returnType: 'ARRAY' };

    parserMock.scopeManager.enterScope();

    parserMock.scopeManager.declare('Function1', mockToken);

    parserMock.scopeManager.exitScope();

    const parsedCode = {
        ast:[ mockToken ]
    };

    const issues = ruleHandler.runRules(parsedCode, parserMock);

    assert.deepEqual(issues, [
      { type: 'Error', message: "Unsupported return type (ARRAY) in 'FunctionDeclaration': Function1", row: 6, col: 9 }
    ]);
  });
});
