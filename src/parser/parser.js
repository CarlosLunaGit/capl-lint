import Tokenizer from '../Tokenizer/Tokenizer.js';
import { ScopeManager } from '../utils/scopeManager.js';

export default class Parser {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.tokens = [];
        this.currentIndex = 0;
        this.errors = [];
        this.ast = [];
        this.declaredVariables = new Map(); // key: variableName, name: token object
        this.undeclaredVariables = new Map();
        this.variablesMetadata = {};
        this.scopeManager = new ScopeManager();

    }

    markVariableAsUsed(name, token) {
        let declaration = this.declaredVariables.get(name);
        if (declaration) {
            declaration.wasUsed = true;
        } else {

            this.undeclaredVariables.set(name, {
                ...token,
                wasDeclared: false,
                wasUsed: true
            });
        }

    }

    getDeclaredUndeclaredState(token) {

        let declaration = this.declaredVariables.get(token.value);

        if (declaration === undefined) {
            return this.undeclaredVariables.get(token.value);
        } else {
            return declaration;
        }

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

    parseIncludeBlockStatement() {
        this.consume('INCLUDESBLOCK', 'Expected INCLUDESBLOCK');
        const value = this.parseBlock(() => this.parseIncludeStatement());
        return { type: 'IncludeBlockStatement', value };
    }

    parseIncludeStatement() {
        let hasHash = false;

        if (this.peek().type === 'HASH') {
            this.consume('HASH', 'Expected HASH');
            hasHash = true;
        }

        if (this.peek().type === 'INCLUDE') {
            this.consume('INCLUDE', 'Expected INCLUDE');
        } else {
            this.errors.push(`Invalid token ${this.peek().type} in IncludeBlock`);
            this.skipToNextStatement();
            return { type: 'InvalidInclude' };
        }

        const includeValue = this.peek().type === 'LITERAL_STRING'
            ? this.consume('LITERAL_STRING', 'Expected LITERAL_STRING').value
            : 'Not Specified';

        return { type: 'IncludeStatement', name: includeValue, hasHash };
    }

    parseVariablesBlockStatement() {

        this.scopeManager.enterScope();

        const variablesBlockToken = this.consume('VARIABLESBLOCK', 'Expected VARIABLESBLOCK');
        const value = this.parseBlock(() => this.parseStatement());

        const exited = this.scopeManager.exitScope();

        return {
            type: 'VariablesBlockStatement',
            value,
            row: variablesBlockToken.row,
            col: variablesBlockToken.col,
         };
    }

    parseTestCaseBlockStatement() {
        this.consume('TESTCASE', 'Expected TESTCASE');
        const testCaseName = this.consume('IDENTIFIER', 'Expected IDENTIFIER').value;

        this.consume('DELIMITER_OPEN_PAREN', 'Expected DELIMITER_OPEN_PAREN');
        const testCaseParameters = this.parseDelimitedList(() =>
            this.parseParameterDeclaration(), 'DELIMITER_CLOSE_PAREN', 'DELIMITER_COMMA'
        );

        // this.scopeManager.enterScope(testCaseName);

        const value = this.parseBlock(() => this.parseStatement());
        return {
            type: 'TestCaseBlockStatement',
            testCaseName,
            testCaseParameters,
            value };
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
        // this.scopeManager.use('j');

        if ((this.peek() !== undefined) && this.peek().type === 'DELIMITER_OPEN_BRACKET') {
            this.consume('DELIMITER_OPEN_BRACKET', 'Expected DELIMITER_OPEN_BRACKET');
            this.consume('LITERAL_NUMBER', 'Expected LITERAL_NUMBER');
            this.consume('DELIMITER_CLOSE_BRACKET', 'Expected DELIMITER_CLOSE_BRACKET');
        }

        let variableValue = null;
        if ((this.peek() !== undefined) && this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT', 'Expected ASSIGNMENT');
            variableValue = this.parseExpression();
        }


        let hasSemicolon = false;

        if ((this.peek() !== undefined) && this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON', 'Expected DELIMITER_SEMICOLON');
        }

        return {
            type: 'VariableDeclaration',
            typeName: type,
            variableName,
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

        this.markVariableAsUsed(variableInitToken.value, variableInitToken);
        const declaration = this.getDeclaredUndeclaredState(variableInitToken);
        return {
            type: 'VariableInitialization',
            variableName: variableInitToken.value,
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

        this.markVariableAsUsed(structToken.value, structToken);
        const declaration = this.getDeclaredUndeclaredState(structToken);

        return {
            type: 'StructMemberVariableInitialization',
            row: structToken.row,
            col: structToken.col,
            variableName: structToken.value,
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

                this.markVariableAsUsed(baseToken.value, baseToken);
                const declaration = this.getDeclaredUndeclaredState(baseToken);

                structAccessNode.wasUsed = declaration?.wasUsed ?? false;
                structAccessNode.wasDeclared = declaration?.wasDeclared ?? false;

                return structAccessNode;
            }

            // Otherwise it's a plain identifier
            this.scopeManager.use(token.value);
            this.markVariableAsUsed(token.value, token);
            const declaration = this.getDeclaredUndeclaredState(token);

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

        throw new Error(`Unexpected token in primary expression: ${token.type}`);
    }



    parseFunctionCall() {
        const args = [];

        const identifierToken = this.consume('IDENTIFIER', 'Expected IDENTIFIER');

        this.markVariableAsUsed(identifierToken.value, identifierToken);
        const declaration = this.getDeclaredUndeclaredState(identifierToken);

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
