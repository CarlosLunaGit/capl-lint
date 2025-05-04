import Tokenizer from '../Tokenizer/Tokenizer.js';

export default class Parser {
  constructor() {
    this.tokenizer = new Tokenizer();
    this.tokens = [];
    this.currentIndex = 0;
    this.errors = [];
  }

  parse(code) {
    this.tokens = this.tokenizer.tokenize(code);
    this.currentIndex = 0;
    this.errors = [];

    const ast = [];

    while (this.currentIndex < this.tokens.length) {
      try {
        const statement = this.parseStatement();
        if (statement) {
            ast.push(statement);
        }
      } catch (err) {
        this.errors.push(err.message);
        this.skipToNextStatement();
      }
    }

    return { ast, errors: this.errors };
  }

  parseStatement() {
    const token = this.peek();

    // Dispatch by token type
    switch (token.type) {
      case 'IF': return this.parseIfStatement();
      case 'ELSE': return this.parseElseStatement();
      case 'RETURN': return this.parseReturnStatement();
      case 'INCLUDESBLOCK': return this.parseIncludeBlockStatement();
      case 'VARIABLESBLOCK': return this.parseVariablesBlockStatement();
      case 'TESTCASE': return this.parseTestCaseBlockStatement();
      case 'TESTFUNCTION': return this.parseTestFunctionBlockStatement?.();
      case 'IDENTIFIER_STRUCT': return this.parseStructStatement();
      case 'IDENTIFIER':
        if (this.peek(1).type === 'DELIMITER_OPEN_BRACE') {
            throw new Error(`Unexpected block after identifier '${token.value}'`);
          }
        if (this.peek(1).type === 'DELIMITER_OPEN_PAREN') {
          return this.parseFunctionCall();
        }
        return this.parseVariableInitialization();
      default:
        if (this.tokenizer.isDataType(token.type)) {
          return this.parseVariableDeclaration();
        }
        throw new Error(`Unexpected statement type: ${token.type} value: ${token.value}`);
    }
  }

  parseBlock(bodyParser) {
    this.consume('DELIMITER_OPEN_BRACE');
    const body = [];
    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      body.push(bodyParser());
    }
    this.consume('DELIMITER_CLOSE_BRACE');
    return body;
  }

  parseIfStatement() {
    const ifToken = this.consume('IF');
    this.consume('DELIMITER_OPEN_PAREN');
    const condition = this.parseExpression();
    this.consume('DELIMITER_CLOSE_PAREN');

    const body = this.parseBlock(() => this.parseStatement());

    const next = this.peek();
    const elseBody = next.type === 'ELSE' ? this.parseElseStatement() : null;

    return { type: 'IfStatement', row: ifToken.row, col: ifToken.col, condition, body, elseBody };
  }

  parseElseStatement() {
    this.consume('ELSE');
    const body = this.parseBlock(() => this.parseStatement());
    return { type: 'ElseStatement', body };
  }

  parseReturnStatement() {
    const returnToken = this.consume('RETURN');
    let returnValue = null;
    if (this.peek().type !== 'DELIMITER_SEMICOLON') {
      returnValue = this.parseExpression();
    }
    this.consume('DELIMITER_SEMICOLON');
    return { type: 'ReturnStatement', row: returnToken.row, col: returnToken.col, value: returnValue };
  }

  parseIncludeBlockStatement() {
    this.consume('INCLUDESBLOCK');
    const value = this.parseBlock(() => this.parseIncludeStatement());
    return { type: 'IncludeBlockStatement', value };
  }

  parseIncludeStatement() {
    let hasHash = false;

    if (this.peek().type === 'HASH') {
      this.consume('HASH');
      hasHash = true;
    }

    if (this.peek().type === 'INCLUDE') {
      this.consume('INCLUDE');
    } else {
      this.errors.push(`Invalid token ${this.peek().type} in IncludeBlock`);
      this.skipToNextStatement();
      return { type: 'InvalidInclude' };
    }

    const includeValue = this.peek().type === 'LITERAL_STRING'
      ? this.consume('LITERAL_STRING').value
      : 'Not Specified';

    return { type: 'IncludeStatement', value: includeValue, hasHash };
  }

  parseVariablesBlockStatement() {
    this.consume('VARIABLESBLOCK');
    const value = this.parseBlock(() => this.parseVariableDeclaration());
    return { type: 'VariablesBlockStatement', value };
  }

  parseTestCaseBlockStatement() {
    this.consume('TESTCASE');
    const testCaseName = this.consume('IDENTIFIER').value;

    this.consume('DELIMITER_OPEN_PAREN');
    const testCaseParameters = this.parseDelimitedList(() =>
      this.parseParameterDeclaration(), 'DELIMITER_CLOSE_PAREN', 'DELIMITER_COMMA'
    );

    const value = this.parseBlock(() => this.parseStatement());
    return { type: 'TestCaseBlockStatement', testCaseName, testCaseParameters, value };
  }

  parseParameterDeclaration() {
    const typeToken = this.consume(this.peek().type); // e.g., INT, ENUM
    let userDefinedTypeName = null;

    if (['ENUM', 'STRUCT'].includes(typeToken.type)) {
      userDefinedTypeName = this.consume('IDENTIFIER').value;
    }

    const parameterName = this.consume('IDENTIFIER').value;
    return { type: 'ParameterDeclaration', parameterName, userDefinedTypeName };
  }

  parseVariableDeclaration() {
    const type = this.consume(this.peek().type).type;
    const variableName = this.consume('IDENTIFIER').value;

    if (this.peek().type === 'DELIMITER_OPEN_BRACKET') {
      this.consume('DELIMITER_OPEN_BRACKET');
      this.consume('LITERAL_NUMBER');
      this.consume('DELIMITER_CLOSE_BRACKET');
    }

    let variableValue = null;
    if (this.peek().type === 'ASSIGNMENT') {
      this.consume('ASSIGNMENT');
      variableValue = this.parseExpression();
    }

    const hasSemicolon = this.consume('DELIMITER_SEMICOLON');
    return { type: 'VariableDeclaration', typeName: type, variableName, variableValue, hasSemicolon: !!hasSemicolon };
  }

  parseVariableInitialization() {
    const variableName = this.consume('IDENTIFIER').value;

    if (this.peek().type === 'DELIMITER_OPEN_BRACKET') {
      this.consume('DELIMITER_OPEN_BRACKET');
      this.consume('LITERAL_NUMBER');
      this.consume('DELIMITER_CLOSE_BRACKET');
    }

    let variableValue = null;
    if (this.peek().type === 'ASSIGNMENT') {
      this.consume('ASSIGNMENT');
      variableValue = this.parseExpression();
    }

    const hasSemicolon = this.consume('DELIMITER_SEMICOLON');
    return { type: 'VariableInitialization', variableName, variableValue, hasSemicolon: !!hasSemicolon };
  }

  parseStructStatement() {
    const variableName = this.consume('IDENTIFIER_STRUCT').value;
    this.consume('DELIMITER_DOT');
    const memberName = this.consume('IDENTIFIER').value;

    let memberValue = null;
    if (this.peek().type === 'ASSIGNMENT') {
      this.consume('ASSIGNMENT');
      const expr = this.parseExpression();
      memberValue = expr;
    }

    const hasSemicolon = this.consume('DELIMITER_SEMICOLON');
    return {
      type: 'StructMemberVariableDeclaration',
      variableName,
      memberName,
      memberValue,
      hasSemicolon: !!hasSemicolon
    };
  }


  parseFunctionCall() {
    const functionName = this.consume('IDENTIFIER').value;
    this.consume('DELIMITER_OPEN_PAREN');

    const args = this.parseDelimitedList(() => {
      const token = this.peek();
      return ['LITERAL_STRING', 'LITERAL_NUMBER', 'IDENTIFIER'].includes(token.type)
        ? this.consume(token.type)
        : (() => { throw new Error(`Unexpected function argument: ${token.value}`); })();
    }, 'DELIMITER_CLOSE_PAREN', 'DELIMITER_COMMA');

    this.consume('DELIMITER_SEMICOLON');
    return { type: 'FunctionCall', functionName, arguments: args };
  }

  parseExpression() {
    let token = this.consume(this.peek().type);
    const logicalOperator = this.peek().type;
    // Handle struct member access expression (e.g., UserStruct2.member2)
    if ((token.type === 'IDENTIFIER' || token.type === 'IDENTIFIER_STRUCT') && !['AND', 'OR'].includes(this.peek().type)) {
      const parts = [token.value];
      while (this.peek().type === 'DELIMITER_DOT') {
        this.consume('DELIMITER_DOT');
        const memberToken = this.consume('IDENTIFIER');
        parts.push(memberToken.value);
      }

      // If it was a member access, return a structured object
      if (parts.length > 1) {
        return {
          type: 'StructMemberAccessExpression',
          variableName: parts[0],
          memberName: parts[1],
          // optionally support deeper chains in the future
        };
      }

      return token;
    }

    // Support conditional expressions like a && b

    if (['AND', 'OR'].includes(logicalOperator)) {
      this.consume(logicalOperator);
      const right = this.consume(this.peek().type);
      return {
        type: 'ConditionalStatement',
        variableNameLeft: token.value,
        logicalOperator,
        variableNameRight: right.value
      };
    }

    return token;
  }


  parseDelimitedList(itemFn, endToken, separatorToken) {
    const items = [];
    while (this.peek().type !== endToken) {
      items.push(itemFn());
      if (this.peek().type === separatorToken) this.consume(separatorToken);
    }
    this.consume(endToken);
    return items;
  }

  peek(offset = 0) {
    return this.tokens[this.currentIndex + offset] || { type: 'EOF', value: '' };
  }

  consume(expectedType) {
    const token = this.tokens[this.currentIndex];
    if (!token || token.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, but got ${token ? token.type : 'EOF'}`);
    }
    this.currentIndex++;
    return token;
  }

  skipToNextStatement() {
    let braceDepth = 0;

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();

      if (token.type === 'DELIMITER_OPEN_BRACE') {
        braceDepth++;
      } else if (token.type === 'DELIMITER_CLOSE_BRACE') {
        if (braceDepth === 0) break;
        braceDepth--;
      } else if (token.type === 'DELIMITER_SEMICOLON' && braceDepth === 0) {
        this.currentIndex++; // consume semicolon
        break;
      }

      this.currentIndex++;
    }
  }

}
