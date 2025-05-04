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
    const program = [];

    while (this.currentIndex < this.tokens.length) {

            const statement = this.parseStatement();

            if (this.errors.length > 0) {
                statement.errors = this.errors;
            }

            if (statement) {
                program.push(statement);
            }

    }

    return program;
  }



  parseStatement() {
    if (this.currentIndex >= this.tokens.length) {
      return null;
    }

    const token = this.tokens[this.currentIndex];

    const DeclarationDataType = this.tokenizer.datatypeslib.filter((item) =>  item.type === token.type) ;

    if (token.type === 'IF') {
        return this.parseIfStatement();
    }else if (token.type === 'ELSE') {
        return this.parseElseStatement();
    }else if (token.type === 'RETURN') {
        return this.parseReturnStatement();
    }else if (token.type === 'INCLUDESBLOCK') {
        return this.parseIncludeBlockStatement();
    }else if (token.type === 'VARIABLESBLOCK') {
        return this.parseVariablesBlockStatement();
    }else if (token.type === 'TESTCASE') {
        return this.parseTestCaseBlockStatement();
    }else if (token.type === 'TESTFUNCTION') {
        return this.parseTestFunctionBlockStatement();
    }else if (token.type === 'IDENTIFIER_STRUCT') {
        return this.parseStructStatement();
    }else if (token.type === 'IDENTIFIER' && this.peek(1).type === 'DELIMITER_OPEN_PAREN') {
        return this.parseFunctionCall();
    }else if (DeclarationDataType.length > 0) {
        return this.parseVariableDeclaration(token.type);
    }else if (token.type === 'IDENTIFIER') {
        return this.parseVariableInitialization();
    }

    throw new Error(`Unexpected statement type: ${token.type} value: ${token.value}`);
  }

  parseIfStatement() {
    this.consume('IF'); // Consume 'if'
    this.consume('DELIMITER_OPEN_PAREN'); // Consume '('

    const condition = this.parseExpression(); // Parse the condition

    this.consume('DELIMITER_CLOSE_PAREN'); // Consume ')'
    this.consume('DELIMITER_OPEN_BRACE'); // Consume '{'

    const body = [];
    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      body.push(this.parseStatement());
    }

    this.consume('DELIMITER_CLOSE_BRACE'); // Consume '}'

    if (this.peek().type === 'ELSE') {
        let elseBody = this.parseElseStatement();
        return { type: 'IfStatement', condition, body, elseBody };
    }else{
        return { type: 'IfStatement', condition, body };
    }


  }

  parseElseStatement() {
    this.consume('ELSE'); // Consume 'if'

    this.consume('DELIMITER_OPEN_BRACE'); // Consume '{'

    const body = [];
    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      body.push(this.parseStatement());
    }

    this.consume('DELIMITER_CLOSE_BRACE'); // Consume '}'

    return { type: 'ElseStatement', body };
  }

  parseReturnStatement() {
    this.consume('RETURN'); // Consume 'return'

    let returnValue = null;
    if (this.peek().type !== 'DELIMITER_SEMICOLON') {
      returnValue = this.parseExpression();
    }

    this.consume('DELIMITER_SEMICOLON'); // Consume ';'

    return { type: 'ReturnStatement', value: returnValue };
  }

  parseIncludeStatement() {

    let hasHash = false;
    let statementType = 'IncludeStatement';

    if (this.peek().type === 'HASH') {
        this.consume('HASH'); // Consume '#'
        hasHash = true;
    }

    if (this.peek().type === 'INCLUDE') {
        this.consume('INCLUDE'); // Consume 'include'
    }
    else {
        this.errors.push(`Not allowed statement within 'IncludeBlockStatement'`);
        // this.skipToNextStatement();
        this.parseStatement();
        statementType = 'NotAllowedStatement';
    }

    let includeValue = "Not Specified";

    if (this.peek().type === 'LITERAL_STRING') {
        includeValue = this.consume('LITERAL_STRING').value;
    }

    return { type: statementType, value: includeValue, hasHash };
  }

  parseIncludeBlockStatement() {
    this.consume('INCLUDESBLOCK'); // Consume 'includesblock'

    this.consume('DELIMITER_OPEN_BRACE'); // Consume '{'

    let includesBlockValue = [];

    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      includesBlockValue.push(this.parseIncludeStatement());
    }

    this.consume('DELIMITER_CLOSE_BRACE'); // Consume '}'

    return { type: 'IncludeBlockStatement', value: includesBlockValue };
  }

  parseVariablesBlockStatement() {
    this.consume('VARIABLESBLOCK'); // Consume 'variablesblock'

    this.consume('DELIMITER_OPEN_BRACE'); // Consume '{'

    const variablesBlockValue = [];

    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      variablesBlockValue.push(this.parseVariableDeclaration(this.peek().type));
    }

    this.consume('DELIMITER_CLOSE_BRACE'); // Consume '}'

    return { type: 'VariablesBlockStatement', value: variablesBlockValue };
  }

  parseTestCaseBlockStatement() {
    this.consume('TESTCASE'); // Consume 'testcase'

    const testCaseName = this.consume('IDENTIFIER').value;

    this.consume('DELIMITER_OPEN_PAREN'); // Consume '('

    const testCaseParameters = [];

    while (this.peek().type !== 'DELIMITER_CLOSE_PAREN') {
      testCaseParameters.push(this.parseParameterDeclaration(this.peek().type));
    }

    this.consume('DELIMITER_CLOSE_PAREN'); // Consume ')'

    this.consume('DELIMITER_OPEN_BRACE'); // Consume '{'

    const testCaseBlockValue = [];

    while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
      testCaseBlockValue.push(this.parseStatement());
    }

    this.consume('DELIMITER_CLOSE_BRACE'); // Consume '}'

    return { type: 'TestCaseBlockStatement', testCaseName, testCaseParameters, value: testCaseBlockValue };
  }

//   parseTestFunctionBlockStatement(){//TODO: Define function}

  parseStructStatement(nestedExpression = false){

    let memberName = null;
    let memberValue = null;
    let hasSemicolon = false;

    const variableName = this.consume('IDENTIFIER_STRUCT').value; // Consume 'Identifier STRUCT type (Initialization)'
    this.consume('DELIMITER_DOT'); // Consume '.'

    memberName = this.consume('IDENTIFIER').value;



    if (this.peek().type === 'ASSIGNMENT') {
      this.consume('ASSIGNMENT'); // Consume '='
      memberValue = this.parseExpression(true);
    }

    if (nestedExpression == false)
    {

        if (this.peek().type !== 'DELIMITER_SEMICOLON') {
            this.errors.push(`Missing semicolon after variable declaration '${variableName.value}'`);
        }
        else {
            this.consume('DELIMITER_SEMICOLON');
            hasSemicolon = true;
        }
    }


    return { type: 'StructMemberVariableDeclaration', variableName, memberName, memberValue, hasSemicolon };

  }

  parseParameterDeclaration(type) {
    this.consume(type); //

    let userDefinedTypeName = null;
    if (type === 'ENUM' || type === 'STRUCT') {

        userDefinedTypeName = this.consume('IDENTIFIER').value;

    }

    const parameterName = this.consume('IDENTIFIER').value;

    if (this.peek().type === 'DELIMITER_COMMA') {
        this.consume('DELIMITER_COMMA'); // Consume ','
      }

    return { type: 'ParameterDeclaration', parameterName, userDefinedTypeName };

  }

    parseVariableDeclaration(type) {
        this.consume(type); // Consume Datatype

        const variableName = this.consume('IDENTIFIER').value;

        // Handle variables that are defined as arrays
        if (this.peek().type === 'DELIMITER_OPEN_BRACKET') {
        this.consume('DELIMITER_OPEN_BRACKET'); // Consume '['
        this.consume('LITERAL_NUMBER'); // Consume array size
        this.consume('DELIMITER_CLOSE_BRACKET'); // Consume ']'
        }

        let variableValue = null;

        if (this.peek().type === 'ASSIGNMENT') {
        this.consume('ASSIGNMENT'); // Consume '='
        variableValue = this.parseExpression();
        }

        let hasSemicolon = false;
        if (this.peek().type !== 'DELIMITER_SEMICOLON') {
            this.errors.push(`Missing semicolon after variable declaration '${variableName.value}'`);
        }
        else {
            this.consume('DELIMITER_SEMICOLON');
            hasSemicolon = true;
        }

        return { type: 'VariableDeclaration', variableName, variableValue, hasSemicolon };
    }

    parseVariableInitialization(){

        const variableName = this.consume('IDENTIFIER').value;

        // Handle variables that are defined as arrays
        if (this.peek().type === 'DELIMITER_OPEN_BRACKET') {
        this.consume('DELIMITER_OPEN_BRACKET'); // Consume '['
        this.consume('LITERAL_NUMBER'); // Consume array size
        this.consume('DELIMITER_CLOSE_BRACKET'); // Consume ']'
        }

        let variableValue = null;

        if (this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT'); // Consume '='
            variableValue = this.parseExpression();
        }

        let hasSemicolon = false;
        if (this.peek().type !== 'DELIMITER_SEMICOLON') {
            this.errors.push(`Missing semicolon after variable initialization '${variableName.value}'`);
        }
        else {
            this.consume('DELIMITER_SEMICOLON');
            hasSemicolon = true;
        }

        return { type: 'VariableInitialization', variableName, variableValue, hasSemicolon };
    }

  parseExpression(nestedExpression = false) {
    const token = this.peek();
    const tokenOffset = this.peek(1);

    if (tokenOffset.type === 'AND' || tokenOffset.type === 'OR')
        {
            return this.parseConditional(token, tokenOffset.type);
        }
    else
        {
            if (token.type === 'IDENTIFIER' || token.type === 'LITERAL_NUMBER' || token.type === 'LITERAL_STRING') {
                return this.consume(token.type);
            }

            if (token.type === 'IDENTIFIER_STRUCT' ) {
                return this.parseStructStatement(nestedExpression);
            }
        }

    throw new Error(`Unexpected token in expression: ${token.value}`);
  }

  parseConditional( token, logicalOperator ){

    const variableNameLeft = this.consume(token.type).value;

    if (this.peek().type === logicalOperator) {
      this.consume(logicalOperator);
    }

    const variableNameRight = this.consume(token.type).value;


    return { type: 'ConditionalStatement', variableNameLeft, logicalOperator, variableNameRight };

  }

  parseFunctionCall() {
    const functionNameToken = this.consume('IDENTIFIER');
    const functionName = functionNameToken.value;

    this.consume('DELIMITER_OPEN_PAREN');

    const args = [];

    while (this.peek().type !== 'DELIMITER_CLOSE_PAREN') {
      if (this.peek().type === 'LITERAL_STRING') {
        args.push(this.consume('LITERAL_STRING'));
      } else if (this.peek().type === 'LITERAL_NUMBER') {
        args.push(this.consume('LITERAL_NUMBER'));
      } else if (this.peek().type === 'IDENTIFIER') {
        // You can expand this to peek for nested function calls later
        args.push(this.consume('IDENTIFIER'));
      } else {
        throw new Error(`Unexpected token in function call arguments: ${this.peek().value}`);
      }

      if (this.peek().type === 'DELIMITER_COMMA') {
        this.consume('DELIMITER_COMMA'); // consume comma
      } else {
        break;
      }
    }

    this.consume('DELIMITER_CLOSE_PAREN');
    this.consume('DELIMITER_SEMICOLON');

    return {
      type: 'FunctionCall',
      functionName,
      arguments: args
    };
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
        // while (this.currentIndex < this.tokens.length && this.tokens[this.currentIndex].type !== 'DELIMITER_SEMICOLON') {
            this.currentIndex++;
        // }
        // if (this.peek().type === 'DELIMITER_SEMICOLON') this.currentIndex++; // Skip past semicolon
    }

  peek( offset = 0) {
    return this.tokens[this.currentIndex + offset] || { type: 'EOF', value: '' };
  }
}
