import Tokenizer from '../Tokenizer/Tokenizer.js';

export default class Parser {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.tokens = [];
        this.currentIndex = 0;
        this.errors = [];
        this.ast = [];
        this.declaredVariables = new Map(); // key: variableName, value: token object
        this.undeclaredVariables = new Map();
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
                this.errors.push(err.message + " row: " + this.tokens[this.currentIndex].row + " col: " + this.tokens[this.currentIndex].col);
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
        const elseToken = this.consume('ELSE');
        const body = this.parseBlock(() => this.parseStatement());
        return {
            type: 'ElseStatement',
            body,
            row: elseToken.row,
            col: elseToken.col
        };
    }

    parseReturnStatement() {
        const returnToken = this.consume('RETURN');
        let returnValue = null;

        if (this.peek().type !== 'DELIMITER_SEMICOLON') {
            returnValue = this.parseExpression();
        }

        this.consume('DELIMITER_SEMICOLON');
        return {
            type: 'ReturnStatement',
            row: returnToken.row,
            col: returnToken.col,
            value: returnValue
        };
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
        const variablesBlockToken = this.consume('VARIABLESBLOCK');
        const value = this.parseBlock(() => this.parseStatement());
        return {
            type: 'VariablesBlockStatement',
            value,
            row: variablesBlockToken.row,
            col: variablesBlockToken.col,
         };
    }

    parseTestCaseBlockStatement() {
        this.consume('TESTCASE');
        const testCaseName = this.consume('IDENTIFIER').value;

        this.consume('DELIMITER_OPEN_PAREN');
        const testCaseParameters = this.parseDelimitedList(() =>
            this.parseParameterDeclaration(), 'DELIMITER_CLOSE_PAREN', 'DELIMITER_COMMA'
        );

        const value = this.parseBlock(() => this.parseStatement());
        return {
            type: 'TestCaseBlockStatement',
            testCaseName,
            testCaseParameters,
            value };
    }

    parseParameterDeclaration() {
        const typeToken = this.consume(this.peek().type); // e.g., INT, ENUM
        let definedType = null;
        let userDefinedTypeName = null;

        definedType = typeToken.type;

        if (['ENUM', 'STRUCT'].includes(typeToken.type)) {
            userDefinedTypeName = this.consume('IDENTIFIER').value;
        }

        const parameterToken = this.consume('IDENTIFIER');
        const parameterName = parameterToken.value;

        this.declaredVariables.set(parameterName, {
            ...parameterToken,
            wasDeclared: true,
            wasUsed: false
        });

        return {
            type: 'ParameterDeclaration',
            parameterName,
            userDefinedTypeName,
            definedType
        };
    }

    parseVariableDeclaration() {
        const type = this.consume(this.peek().type).type;
        const variableToken = this.consume('IDENTIFIER');
        const variableName = variableToken.value;

        // Store declaration metadata before any possible usage
        this.declaredVariables.set(variableName, {
            ...variableToken,
            wasDeclared: true,
            wasUsed: false
        });

        const declaration = this.getDeclaredUndeclaredState(variableToken);

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


        let hasSemicolon = false;

        if (this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON');
        }

        return {
            type: 'VariableDeclaration',
            typeName: type,
            variableName,
            variableValue,
            hasSemicolon: !!hasSemicolon,
            row: variableToken.row,
            col: variableToken.col,
            wasUsed: declaration.wasUsed,
            wasDeclared: declaration.wasDeclared
        };
    }


    parseVariableInitialization() {
        const variableInitToken = this.consume('IDENTIFIER');

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

        let hasSemicolon = this.consume('DELIMITER_SEMICOLON');

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
        const structToken = this.consume('IDENTIFIER_STRUCT');
        this.consume('DELIMITER_DOT');
        const memberName = this.consume('IDENTIFIER').value;

        let memberValue = null;
        if (this.peek().type === 'ASSIGNMENT') {
            this.consume('ASSIGNMENT');
            const expr = this.parseExpression();
            memberValue = expr;
        }

        let hasSemicolon = false;

        if (this.peek().type == 'DELIMITER_SEMICOLON') {
            hasSemicolon = this.consume('DELIMITER_SEMICOLON');
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


    parseFunctionCall() {
        const functionToken = this.consume('IDENTIFIER');
        this.consume('DELIMITER_OPEN_PAREN');

        const args = this.parseDelimitedList(
            () => this.parseExpression(),
            'DELIMITER_CLOSE_PAREN',
            'DELIMITER_COMMA'
        );

        if (this.peek().type === 'DELIMITER_SEMICOLON') {
            this.consume('DELIMITER_SEMICOLON');
        }

        this.markVariableAsUsed(functionToken.value, functionToken);
        const declaration = this.getDeclaredUndeclaredState(functionToken);
        return {
            type: 'FunctionCall',
            functionName: functionToken.value,
            arguments: args,
            row: functionToken.row,
            col: functionToken.col,
            wasUsed: declaration?.wasUsed ?? false,
            wasDeclared: declaration?.wasDeclared ?? false,
        };
    }

    parseExpression() {
        let token = this.consume(this.peek().type);

        if (token.type === 'IDENTIFIER') {
            this.markVariableAsUsed(token.value, token);
        }

        if (token.type === 'IDENTIFIER' && this.peek().type === 'DELIMITER_OPEN_PAREN') {
            this.currentIndex--; // rewind one step so we can parse the function call properly
            return this.parseFunctionCall(); // nested call
        }


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

                this.markVariableAsUsed(parts[0], token);
                const declaration = this.getDeclaredUndeclaredState(token);

                return {
                    type: 'StructMemberAccessExpression',
                    variableName: parts[0],
                    memberName: parts[1],
                    col: token.col,
                    row: token.row,
                    wasUsed: declaration?.wasUsed ?? false,
                    wasDeclared: declaration?.wasDeclared ?? false,
                    // TODO: optionally support deeper chains in the future
                };
            }
            this.markVariableAsUsed(parts[0], token);
            const declaration = this.getDeclaredUndeclaredState(token);
            return {
                type: token.type,
                value: token.value,
                col: token.col,
                row: token.row,
                wasUsed: declaration?.wasUsed ?? false,
                wasDeclared: declaration?.wasDeclared ?? false,

            };
        }

        // Support conditional expressions like a && b

        if (['AND', 'OR'].includes(logicalOperator)) {
            const logicalOpToken = this.consume(logicalOperator);
            const right = this.peek();

            if (token.type === 'IDENTIFIER') {
                this.markVariableAsUsed(token.value, token);
            }

            if (right.type === 'IDENTIFIER') {
                this.markVariableAsUsed(right.value, right);
            }

            const rightConsumed = this.consume(right.type);

            const declarationLeft = this.getDeclaredUndeclaredState(token);

            const declarationRight = this.getDeclaredUndeclaredState(right);

            return {
                type: 'ConditionalStatement',
                variableNameLeft: token.value,
                logicalOperator,
                variableNameRight: rightConsumed.value,
                col: logicalOpToken.col,
                row: logicalOpToken.row,
                wasUsedLeft: declarationLeft?.wasUsed ?? false,
                wasDeclaredLeft: declarationLeft?.wasDeclared ?? false,
                wasUsedRight: declarationRight?.wasUsed ?? false,
                wasDeclaredRight: declarationRight?.wasDeclared ?? false,
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

            if (this.peek(1).type === "EOF" && this.currentIndex === this.tokens.length-1) {
                this.currentIndex++; // consume semicolon
                break;
            }

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
