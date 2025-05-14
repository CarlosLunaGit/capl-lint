import Tokenizer from '../Tokenizer/Tokenizer.js';
import { ScopeManager } from '../utils/scopeManager.js';

export default class Parser {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.tokens = [];
        this.currentIndex = 0;
        this.errors = [];
        this.ast = [];
        this.scopeManager = new ScopeManager();

    }


    parse(code) {
        this.tokens = this.tokenizer.tokenize(code);
        this.currentIndex = 0;
        this.errors = [];

        this.ast = [];

        while (this.currentIndex < this.tokens.length) {
            try {
                const statement = this.parseStatement();
                if (statement) {
                    this.ast.push(statement);
                }
            } catch (err) {

                const token = this.tokens[this.currentIndex];
                if (token) {
                    this.errors.push(`${err.message} row: ${token.row} col: ${token.col} stack: ${err.stack}`);
                } else {
                    this.errors.push(`${err.message} at EOF or invalid token index (index: ${this.currentIndex}). stack: ${err.stack}`);
                }

                this.skipToNextStatement();
            }
        }

        return { ast: this.ast, errors: this.errors };
    }

    parseStatement() {
        const token = this.peek();

        // Dispatch by token type
        switch (token.type) {
            case 'HASH': return this.parseIncludeStatement();
            case 'IF': return this.parseIfStatement();
            case 'ELSE': return this.parseElseStatement();
            case 'RETURN': return this.parseReturnStatement();
            case 'INCLUDESBLOCK': return this.parseIncludeBlockStatement();
            case 'VARIABLESBLOCK': return this.parseVariablesBlockStatement();
            case 'TESTCASE': return this.parseTestCaseBlockStatement();
            case 'TESTFUNCTION':
                if (!this.parseTestFunctionBlockStatement) {
                    throw new Error('Missing parseTestFunctionBlockStatement implementation');
                }
                return this.parseTestFunctionBlockStatement();

            case 'IDENTIFIER_STRUCT': return this.parseStructStatement();
            case 'IDENTIFIER':
                if (this.next() === 'DELIMITER_OPEN_BRACE') {
                    throw new Error(`Unexpected block after IDENTIFIER '${token.value}'`);
                }
                if (this.next() === 'DELIMITER_OPEN_PAREN') {
                    return this.parseFunctionCall();
                }
                return this.parseVariableInitialization();
            default:
                if (this.tokenizer.isDataType(token.type)) {
                    return this.parseVariableDeclaration();
                }
                throw new Error(`Unexpected statement type: ${token.type} name: ${token.value}`);
        }
    }

    // parseVariablesBlockStatement() {

    //     this.scopeManager.enterScope('VariablesBlock');

    //     const variablesBlockToken = this.consume('VARIABLESBLOCK', 'Expected VARIABLESBLOCK');

    //     const body = this.parseBlock(() => this.parseStatement());

    //     const exited = this.scopeManager.exitScope();

    //     return {
    //         type: 'VariablesBlockStatement',
    //         body,
    //         row: variablesBlockToken.row,
    //         col: variablesBlockToken.col,
    //      };
    // }

    parseVariablesBlockStatement() {
    this.scopeManager.enterScope('VariablesBlock');

    const variablesBlockToken = this.consume('VARIABLESBLOCK', 'Expected VARIABLESBLOCK');

    const body = this.parseBlock(() => {
        const statement = this.parseStatement();

        // Validate statement type
        if (!['VariableDeclaration', 'VariableInitialization'].includes(statement.type)) {
            this.errors.push({
                message: `Invalid statement ${statement.type} in VariablesBlock`,
                row: statement.row,
                col: statement.col,
                type: 'Error',
                }
            );
            return null; // Skip invalid statements
        }

        return statement;
    });

    this.scopeManager.exitScope();

    return {
        type: 'VariablesBlockStatement',
        body: body.filter(Boolean), // Remove null entries for invalid statements
        row: variablesBlockToken.row,
        col: variablesBlockToken.col,
    };
}

    parseIncludeBlockStatement() {
        this.consume('INCLUDESBLOCK', 'Expected INCLUDESBLOCK');
        const body = this.parseBlock(() => this.parseIncludeStatement());
        return { type: 'IncludeBlockStatement', body };
    }

    parseIncludeStatement() {
        let hasHash = false;
        let includeToken;

        if (this.peek().type === 'HASH') {
            this.consume('HASH', 'Expected HASH');
            hasHash = true;
        }

        if (this.peek().type === 'INCLUDE') {
            includeToken = this.consume('INCLUDE', 'Expected INCLUDE');
        } else {
            let invalidToken = this.consume(this.peek().type, `Expected ${this.peek().type}`);
            this.errors.push({
                message: `Invalid token ${invalidToken.type} in IncludeStatement`,
                row: invalidToken.row,
                col: invalidToken.col,
                type: 'Error',
            });
            this.skipToNextStatement();
            return { type: 'InvalidInclude',
            name: invalidToken.value,
            value: invalidToken,
            row: invalidToken.row,
            col: invalidToken.col };
        }

        const includeValue = this.peek().type === 'LITERAL_STRING'
            ? this.consume('LITERAL_STRING', 'Expected LITERAL_STRING').value
            : 'Not Specified';

        if (this.peek().type === 'DELIMITER_SEMICOLON') {
            let invalidSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
            this.errors.push({
                message: `Invalid semicolon ${invalidSemicolon.type} in IncludeStatement`,
                row: invalidSemicolon.row,
                col: invalidSemicolon.col,
                type: 'Error',
            });
            // this.skipToNextStatement();
            return { type: 'InvalidInclude',
            name: invalidSemicolon.value,
            value: invalidSemicolon,
            row: invalidSemicolon.row,
            col: invalidSemicolon.col };
        }

        return { type: 'IncludeStatement',
            name: includeToken.value,
            value: includeValue,
            hasHash,
            row: includeToken.row,
            col: includeToken.col };
    }

    parseBlock(bodyParser) {
        this.consume('DELIMITER_OPEN_BRACE', 'Expected DELIMITER_OPEN_BRACE');
        const body = [];
        while (this.peek().type !== 'DELIMITER_CLOSE_BRACE') {
            body.push(bodyParser());
        }
        this.consume('DELIMITER_CLOSE_BRACE', 'Expected DELIMITER_CLOSE_BRACE');
        return body;
    }

    parseIfStatement() {
        const ifToken = this.consume('IF', 'Expected IF');
        this.consume('DELIMITER_OPEN_PAREN', 'Expected DELIMITER_OPEN_PAREN');
        const condition = this.parseExpression();
        this.consume('DELIMITER_CLOSE_PAREN', 'Expected DELIMITER_CLOSE_PAREN');

        const body = this.parseBlock(() => this.parseStatement());

        const next = this.peek();
        // const elseBody = next.type === 'ELSE' ? this.parseElseStatement() : null;
        const elseBody = next && next.type === 'ELSE' ? this.parseElseStatement() : null;
        return {
            type: 'IfStatement',
            row: ifToken.row,
            col: ifToken.col,
            condition,
            body,
            elseBody };
    }

    parseElseStatement() {
        const elseToken = this.consume('ELSE', 'Expected ELSE');
        const body = this.parseBlock(() => this.parseStatement());
        return {
            type: 'ElseStatement',
            body,
            row: elseToken.row,
            col: elseToken.col
        };
    }

    parseReturnStatement() {
        const returnToken = this.consume('RETURN', 'Expected RETURN');
        let returnValue = null;

        if (this.peek().type !== 'DELIMITER_SEMICOLON') {
            returnValue = this.parseExpression();
        }

        let hasSemicolon = false;

        if (this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
        }

        return {
            type: 'ReturnStatement',
            row: returnToken.row,
            col: returnToken.col,
            name: returnValue,
            hasSemicolon: !!hasSemicolon,
        };
    }

    parseTestCaseBlockStatement() {
        const testCaseBlockToken = this.consume('TESTCASE', 'Expected TESTCASE');
        const name = this.consume('IDENTIFIER', 'Expected IDENTIFIER').value;

        this.consume('DELIMITER_OPEN_PAREN', 'Expected DELIMITER_OPEN_PAREN');
        const parameters = this.parseDelimitedList(() =>
            this.parseParameterDeclaration(), 'DELIMITER_CLOSE_PAREN', 'DELIMITER_COMMA'
        );

        this.scopeManager.enterScope(name + "_TestCaseBlock");

        const body = this.parseBlock(() => this.parseStatement());

        const exited = this.scopeManager.exitScope();

        return {
            type: 'TestCaseBlockStatement',
            name,
            parameters,
            body,
            row: testCaseBlockToken.row,
            col: testCaseBlockToken.col
        };
    }

    parseParameterDeclaration() {
        const typeToken = this.consume(this.peek().type, `Expected ${this.peek().type}`); // e.g., INT, ENUM
        let definedType = null;
        let userDefinedTypeName = null;

        definedType = typeToken.type;

        if (['ENUM', 'STRUCT'].includes(typeToken.type)) {
            userDefinedTypeName = this.consume('IDENTIFIER', 'Expected IDENTIFIER').value;
        }

        const parameterToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');
        const parameterName = parameterToken.value;

        this.scopeManager.declare(parameterName, parameterToken);

        return {
            type: 'ParameterDeclaration',
            parameterName,
            userDefinedTypeName,
            definedType
        };
    }

    parseVariableDeclaration() {
        const type = this.consume(this.peek().type, `Expected ${this.peek().type}`).type;
        const variableToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');
        const variableName = variableToken.value;

        // Store declaration metadata before any possible usage
        this.scopeManager.declare(variableName, variableToken);

        // this.scopeManager.trackVariableUsage(variableName, variableToken);
        const declaration = this.scopeManager.getVariable(variableName);

        if ((this.peek() !== undefined) && this.peek().type === 'DELIMITER_OPEN_BRACKET') {
            this.consume('DELIMITER_OPEN_BRACKET', 'Expected DELIMITER_OPEN_BRACKET');
            this.consume('LITERAL_NUMBER', 'Expected LITERAL_NUMBER');
            this.consume('DELIMITER_CLOSE_BRACKET', 'Expected DELIMITER_CLOSE_BRACKET');
        }

        let variableValue = null;
        if ((this.peek() !== undefined) && this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT', 'Expected ASSIGNMENT');
            // Check if the initialization is a list of items
            if (this.peek().type === 'DELIMITER_OPEN_BRACE') {
                variableValue = this.parseVariableInitializationValue();
            } else {
                variableValue = this.parseExpression();
            }
        }


        let hasSemicolon = false;

        if ((this.peek() !== undefined) && this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
        }

        return {
            type: 'VariableDeclaration',
            typeCategory: type,
            name: variableName,
            variableValue,
            hasSemicolon: !!hasSemicolon,
            row: variableToken.row,
            col: variableToken.col,
            wasUsed: !!declaration.wasUsed,
            wasDeclared: !!declaration.wasDeclared
        };
    }


    parseVariableInitialization() {
        const variableInitToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');

        if (this.peek().type === 'DELIMITER_OPEN_BRACKET') {
            this.consume('DELIMITER_OPEN_BRACKET', 'Expected DELIMITER_OPEN_BRACKET');
            this.consume('LITERAL_NUMBER', 'Expected LITERAL_NUMBER');
            this.consume('DELIMITER_CLOSE_BRACKET', 'Expected DELIMITER_CLOSE_BRACKET');
        }

        let variableValue = null;
        if (this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT', 'Expected ASSIGNMENT');
            variableValue = this.parseExpression();
        }

        let hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');

        this.scopeManager.trackVariableUsage(variableInitToken.value, variableInitToken);
        const declaration = this.scopeManager.getVariable(variableInitToken.value);

        return {
            type: 'VariableInitialization',
            name: variableInitToken.value,
            variableValue,
            hasSemicolon: !!hasSemicolon,
            row: variableInitToken.row,
            col: variableInitToken.col,
            wasUsed: declaration?.wasUsed ?? false,
            wasDeclared: declaration?.wasDeclared ?? false,
        };
    }

    parseStructStatement() {
        const structToken = this.consume('IDENTIFIER_STRUCT', 'Expected IDENTIFIER_STRUCT');
        this.consume('DELIMITER_DOT', 'Expected DELIMITER_DOT');
        const memberName = this.consume('IDENTIFIER', 'Expected IDENTIFIER').value;

        let memberValue = null;
        if ((this.peek() !== undefined) && this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT', 'Expected ASSIGNMENT');
            const expr = this.parseExpression();
            memberValue = expr;
        }

        let hasSemicolon = false;

        if ((this.peek() !== undefined) && this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
        }

        this.scopeManager.trackVariableUsage(structToken.value + '.' + memberName, structToken);
        const declaration = this.scopeManager.getVariable(structToken.value + '.' + memberName);

        return {
            type: 'StructMemberVariableInitialization',
            row: structToken.row,
            col: structToken.col,
            name: structToken.value,
            memberName,
            memberValue,
            hasSemicolon: !!hasSemicolon,
            wasUsed: declaration?.wasUsed ?? false,
            wasDeclared: declaration?.wasDeclared ?? false,
        };
    }

    parseExpression() {
        return this.parseLogicalExpression();
    }

    parseLogicalExpression() {
        let left = this.parseEqualityExpression();

        while (this.match('AND', 'OR')) {
            const operator = this.previous();
            const right = this.parseEqualityExpression();
            left = {
                type: 'LogicalExpression',
                operator: operator.type,
                left,
                right
            };
        }

        return left;
    }

    parseEqualityExpression() {
        let left = this.parsePrimaryExpression();

        while (this.match('OPERATOR_EQUAL', 'NOT_EQUAL')) {
            const operator = this.previous();
            const right = this.parsePrimaryExpression();
            left = {
                type: 'BINARY_EXPRESSION',
                operator: operator.type,
                left,
                right
            };
        }

        return left;
    }

    parseVariableInitializationValue() {
        this.consume('DELIMITER_OPEN_BRACE', 'Expected DELIMITER_OPEN_BRACE for variable initialization');

        const items = this.parseDelimitedList(
            () => this.parseExpression(), // Parse each item as an expression
            'DELIMITER_CLOSE_BRACE', // End token
            'DELIMITER_COMMA' // Separator token
        );

        return {
            type: 'VariableInitializationValue',
            items,
            row: this.previous().row,
            col: this.previous().col,
        };
    }

    parsePrimaryExpression() {
        const token = this.peek();

        if (this.next() === 'DELIMITER_OPEN_PAREN') {
            return this.parseFunctionCall();
        }

        // Support Struct Member Access Expressions like `UserStruct2.member2`
        if (token.type === 'IDENTIFIER' || token.type === 'IDENTIFIER_STRUCT') {
            const baseToken = this.consume(token.type, `Expected ${token.type}`);

            // Handle member access (e.g., UserStruct2.member2)
            if (this.match('DELIMITER_DOT')) {
                const dotToken = this.previous(); // Optional: useful for error metadata
                const memberToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');

                const structAccessNode = {
                    type: 'StructMemberAccessExpression',
                    variableName: baseToken.value,
                    memberName: memberToken.value,
                    row: baseToken.row,
                    col: baseToken.col
                };

                this.scopeManager.trackVariableUsage(baseToken.value + '.' + memberToken.value, baseToken);
                const declaration = this.scopeManager.getVariable(baseToken.value + '.' + memberToken.value);

                structAccessNode.wasUsed = declaration?.wasUsed ?? false;
                structAccessNode.wasDeclared = declaration?.wasDeclared ?? false;

                return structAccessNode;
            }

            this.scopeManager.trackVariableUsage(token.value, token);
            const declaration = this.scopeManager.getVariable(token.value);

            return {
                type: 'IDENTIFIER',
                name: token.value,
                row: token.row,
                col: token.col,
                wasUsed: declaration?.wasUsed ?? false,
                wasDeclared: declaration?.wasDeclared ?? false
            };
        }

        // You can add literal handling (number, string, etc.) here
        if (token.type === 'LITERAL_NUMBER') {
            const numberToken = this.consume('LITERAL_NUMBER', 'Expected LITERAL_NUMBER');

            return {
                type: 'LITERAL_NUMBER',
                name: numberToken.value,
                row: numberToken.row,
                col: numberToken.col
            };
        }

        if (token.type === 'LITERAL_STRING') {
            const stringToken = this.consume('LITERAL_STRING', 'Expected LITERAL_STRING');

            return {
                type: 'LITERAL_STRING',
                name: stringToken.value,
                col: stringToken.col,
                row: stringToken.row
            };
        }

        if (token.type === 'LITERAL_HEXADECIMAL') {
            const hexToken = this.consume('LITERAL_HEXADECIMAL', 'Expected LITERAL_HEXADECIMAL');

            return {
                type: 'LITERAL_HEXADECIMAL',
                name: hexToken.value,
                col: hexToken.col,
                row: hexToken.row
            };
        }

        throw new Error(`Unexpected token in primary expression: ${token.type}`);
    }



    parseFunctionCall() {
        const args = [];

        const identifierToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');

        this.scopeManager.trackVariableUsage(identifierToken.value, identifierToken);
        const declaration = this.scopeManager.getVariable(identifierToken.value);

        this.consume('DELIMITER_OPEN_PAREN', 'Expected DELIMITER_OPEN_PAREN');

        if (!this.check('DELIMITER_CLOSE_PAREN')) {
            do {
                args.push(this.parseExpression());
            } while (this.match('DELIMITER_COMMA'));
        }

        this.consume('DELIMITER_CLOSE_PAREN', 'Expected DELIMITER_CLOSE_PAREN');

        let hasSemicolon = false;

        if (this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
        }

        return {
            type: 'FunctionCallExpression',
            name: identifierToken.value,
            arguments: args,
            hasSemicolon: !!hasSemicolon,
            col: identifierToken.col,
            row: identifierToken.row,
            wasUsed: declaration?.wasUsed ?? false,
            wasDeclared: declaration?.wasDeclared ?? false
        };
    }



    parseDelimitedList(itemFn, endToken, separatorToken) {
        const items = [];
        while (this.peek().type !== endToken) {
            items.push(itemFn());
            if (this.peek().type === separatorToken) this.consume(separatorToken, `Expected ${separatorToken}`);
        }
        this.consume(endToken, `Expected ${endToken}`);
        return items;
    }

    skipToNextStatement() {
        let braceDepth = 0;

        while (!this.isAtEnd()) {
            const token = this.peek();
            const nextToken = this.tokens[this.currentIndex + 1] ?? { type: 'EOF' };

            if (nextToken.type === 'EOF' && this.currentIndex === this.tokens.length - 1) {
                this.advance(); // consume last semicolon or EOF
                break;
            }

            if (token.type === 'DELIMITER_OPEN_BRACE') {
                braceDepth++;
            } else if (token.type === 'DELIMITER_CLOSE_BRACE') {
                if (braceDepth === 0) break;
                braceDepth--;
            } else if (token.type === 'DELIMITER_SEMICOLON' && braceDepth === 0) {
                this.advance(); // consume semicolon
                break;
            }

            this.advance();
        }
    }


    consume(expectedType, errorMessage) {
        if (this.match(expectedType)) return this.previous();
        throw new Error(`${errorMessage}. Got: ${this.peek().type}`);
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.currentIndex++;
        return this.previous();
    }

    peek() {
        return this.tokens[this.currentIndex];
    }

    previous() {
        return this.tokens[this.currentIndex - 1];
    }

    next() {
        return this.tokens[this.currentIndex + 1]?.type ?? 'EOF'
    }

    isAtEnd() {
        return this.currentIndex >= this.tokens.length;
    }

}
