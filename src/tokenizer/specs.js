/**
 * Tokenizer spec.
 */
export const blocksSpec = [
    // ---------------------------------------
    // Blocks
    // IncludesBlock:

    ['INCLUDESBLOCK', /^(?<name>includes)(?:\s*)?(?<openCurly>\{)?(?:\s*)?(?<body>.*?)(?:\s*)?/, 'IncludesBlock'],

    // VariablesBlock:

    ['VARIABLESBLOCK', /^(?<name>variables)(?:\s*)?(?<openCurly>\{)?(?:\s*)?(?<body>.*?)(?:\s*)?/, 'VariablesBlock'],

    // FunctionBlock:

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword|enum)(?:\[\])?)\s*(?<customeType>.*?)?\s*(?<name>\w+)\s*(?<openParen>\()\s*(?<arguments>.*?)?\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'FunctionsBlock'],

    // MessageDefinitionBlock:

    ['MESSAGEDEFINITIONBLOCK', /^(?<dataType>message)\s*(?<name>\w+)\s*(?<openCurly>\{)/, 'MessageDefinitionBlock'],

    // MessageEventBlock:

    ['MESSAGEEVENTBLOCK', /^(?<dataType>on message)\s*(?<name>\w+)\s*(?<openCurly>\{)/, 'MessageEventBlock'],

    // StartEventBlock:

    ['STARTEVENTBLOCK', /^(?<dataType>on start)\s*(?<openCurly>\{)/, 'StartEventBlock'],

    // TimerEventBlock:

    ['TIMEREVENTBLOCK', /^(?<dataType>on timer)\s*(?<name>\w+)\s*(?<openCurly>\{)/, 'TimerEventBlock'],

    // IF block:

    ['IF', /^(?<ifkey>if)\s*(?<openParen>\()(?<conditional>(?:[^()]|\((?:[^()]|\([^()]*\))*\))*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'ifCall'],
    ['IF', /^(?<ifkey>if)\s*(?<openParen>\()(?<conditional>(?:[^()]|\((?:[^()]|\([^()]*\))*\))*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)?/, 'ifCallNoBrackets'], // if without brackets
    ['ELSEIF', /^(?<elseifkey>else if)\s*(?<openParen>\()(?<conditional>(?:[^()]|\((?:[^()]|\([^()]*\))*\))*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'elseIfCall'],
    ['ELSE', /^(?<elsekey>else)\s*(?<openCurly>\{)?/, 'elseCall'],

    // While block:

    ['WHILE', /^(?<whilekey>while)\s*(?<openParen>\()(?<conditional>(?:[^()]|\((?:[^()]|\([^()]*\))*\))*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'whileCall'],

    // For loop:

    ['FORLOOP', /^(?<forkey>for)\s*(?<openParen>\()(?<initializer>.*?;.*?;.*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'forLoop'],

    // Whitespace:

    [null, /^(?<spaces>\s+)/, 'Whitespace'],

    // Comments:
    // Skip single-line comments:
    [null, /^(?<identifier>\/\/)(?<text>.*)/, 'Comment'],

    // Skip multi-line comments:
    [null, /^(?<commentOpenBlock>\/\*)(?<text>[\s\S]*?)(?<commentCloseBlock>\*\/)/, 'CommentMultiline'],

    // Semicolon:

    ['SEMICOLON', /^;+/, 'Semicolon'],

    // Numbers:

    ['NUMBER', /^\d+/, 'Number'],

    // Strings:

    ['STRING', /^"[^"]*"/, 'StringDoubleQuote'],
    ['STRING', /^'[^']*'/, 'StringSingleQuote'],

    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")(?<semicolon>;)?/, 'IncludeStatement'],

    // Diagnostic Message Variable Declaration:

    ['VARIABLEDECLARATION_DIAGMESSAGE', /^(?<type>diagRequest|diagResponse)\s*(?<ecuQualifier>\w+)?\s*::\s*(?<serviceIdentifier1>\w+)\s*::\s*(?<serviceIdentifier2>\w+)?\s*(?<objectName>\w+)\s*(?<semicolon>;)?/, 'DiagMessage'],

    // Multiple variable declaration:

    ['VARIABLEDECLARATION_MULTIPLE', /^(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<variables>\w+(?:\[\d+\])?(?:\s*=\s*[^,;]+)?(?:\s*,\s*\w+(?:\[\d+\])?(?:\s*=\s*[^,;]+)?)+)(?<semicolon>;)?/, 'VariableDeclarationMultiple'],

    // Timer variable declaration

    ['VARIABLEDECLARATION_STIMER', /^(?<timerKeyword>timer) +(?<variableName>\w+) *(?<semicolon>;)?/, 'VariableDeclarationSecondsTimer'],

    // Type definition:
    ['TYPEDEFINITION_ENUM_NO_INSTANTIATION', /^(?<enumKeyword>enum) +(?<enumTypeName>\w+)\s*(?<openingbracket>\{)\s*(?<enumValues>[^}]+)\s*(?<closingbracket>\})\s*(?<semicolon>;)?/, 'TypeDefEnumNoInstantiation'],
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+)(?<arraySize>(?:\[\d+\])*)? *(?<assignment>=)? *(?<value>(?:\{[^}]*\}|\"[^\"]*\"|[^;\s]+))? *(?<semicolon>;)?/, 'VariableDeclaration'],
    ['VARIABLEDECLARATION_ENUM', /^(?<enumKeyword>enum) +(?<enumType>\w+) +(?<name>\w+) *(?<arrayStart>\[)?(?<arraySize>\d+)?(?<arrayEnd>\])?(?<semicolon>;)?/, 'VariableDeclarationEnum'],
    ['VARIABLEDECLARATION_STRUCT1DARRAY', /^(?<structKeyword>struct)\s+(?<dataType>\w+)\s+(?<name>\w+)\s*(?<arrayStart>\[)?(?<arraySize>\d+)?(?<arrayEnd>\])?(?<semicolon>;)?/, 'VariableDeclarationStructArray1D'],
    ['VARIABLEDECLARATION_STRUCT1DARRAY_BODY', /^(?<structKeyword>struct)\s+(?<structType>\w+)\s*(?<openingbracket>\{)\s*(?<structBody>[^}]+)\s*(?<closingbracket>\})\s*(?<variableName>\w+)(?:\[(?<arraySize>\d+)\])\s*(?<semicolon>;)?/, 'VariableDeclarationStructArray1DBody'],
    ['VARIABLEDECLARATION_STRUCT', /^(?<structKeyword>struct)\s*(?<structType>\w+)\s+(?<name>\w+)\s*(?<semicolon>;)?/, 'VariableDeclarationStruct'],
    ['VARIABLEDECLARATION_STRUCT_BODY', /^(?<structKeyword>struct)\s*(?<structType>\w+)\s*(?<openingbracket>\{)\s*(?<structBody>[^}]+)\s*(?<closingbracket>\})\s*(?<name>\w+)\s*(?<semicolon>;)?/, 'VariableDeclarationStructBody'],

    // System Variable declaration:

    ['SYSVARINITIALIZATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<assignment>=)\s*(?<value>[^;]+)?(?<semicolon>;)?/, 'SysvarInitialization'],
    ['SYSVARDECLARATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<semicolon>;)?/, 'SysvarDeclaration'],

    // Function Call:

    // ['FUNCTIONCALL', /^(?<name>\w+)\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/],
    ['FUNCTIONCALL', /^(?<name>(?:(?!\bif\b|\belse\b)\b\w+\b))\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/, 'FunctionCall'],

    // Initialization Statement:

    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT', /^(?<variable>\w+)\[(?<index>\d+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElement'],
    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT_VARIABLE_AS_INDEX', /^(?<variable>\w+)\[(?<index>[a-zA-Z]+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElementVariableAsIndex'],
    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT_OPERATION', /^(?<variable>\w+)\[(?<index>[a-zA-Z]\s*\+\s*[0-9]+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElementOperation'],
    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT_2DIMENSIONS', /^(?<variable>\w+)\[(?<index1>\d+)\]\[(?<index2>\d+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElement2Dimensions'],
    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT_2DIMENSIONS_VARIABLE_AS_INDEX', /^(?<variable>\w+)\[(?<index>[a-zA-Z]+)\]\s*\[(?<index2>[a-zA-Z]+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElement2DimensionsVariableAsIndex'],
    ['INITIALIZATIONSTATEMENT_TERNARY', /^(?<variable>\w+)\s*=\s*(?<condition>.+?)\s*\?\s*(?<trueValue>.+?)\s*:\s*(?<falseValue>.+?)(?<semicolon>;)?/, 'InitializationStatementTernary'],
    ['INITIALIZATIONSTATEMENT_FUNCTIONCALL_WITH_ARITHMETIC_OPERATION', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<functionName>\w+)\((?<arguments>[^;]*)\)\s*(?<operator>[+\-*/])\s*(?<operand>[^;]+)(?<semicolon>;)?/, 'InitializationStatementFunctionCallWithArithmeticOperation'],
    ['INITIALIZATIONSTATEMENT_FUNCTIONCALL', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<functionName>\w+)\((?<arguments>[^;]*)\)(?<semicolon>;)?/, 'InitializationStatementFunctionCall'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\(.*\)\s*\+\s*0x[\da-fA-F]+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = (variable2 + 0x1);
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\s*\+\s*\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = variable2 + variable3;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\s*\-\s*\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = variable2 - variable3;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+\[(?:\w+)\].\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1.nestedproparray1[index].nestedprop = variable2;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\.\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1.nestedprop = variable2.nestedprop;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1.nestedprop = variable2;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\w+\[\w+\]\.\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = variable2[index].nestedprop;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\w+\.\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = variable2.nestedprop;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = variable2;
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\d*)(?<semicolon>;)?/, 'InitializationStatement'], // e.g variable1 = 1;
    // ^(?<variable>\w+)\s*=\s*(?<expression>.+?)(?<semicolon>;)?$ // This pattern captures any expression on the right side of the = until an optional semicolon. It's less specific but more flexible.

    // Return Statement:

    ['RETURN', /^(?<returnStatement>return)\s*(?<returnedValue>[^;]*)?\s*(?<semicolon>;)?/, 'ReturnStatement'],

    // Break Statement:

    ['BREAK', /^(?<breakStatement>break)\s*(?<semicolon>;)?/, 'BreakStatement'],

    // Opening block:

    ['OPENINGBLOCK', /^(?<openCurly>\{)\s*(?<semicolon>;)?/, 'OpeningBlock'],

    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})\s*(?<semicolon>;)?/, 'ClosingBlock'],

    // Increment statement:

    ['INCREMENT', /^(?<variable>\w+)\s*(?<incrementKey>\+\+)\s*(?<semicolon>;)?/, 'IncrementStatement'],

    // Unexpected:

    ['UNEXPECTED', /^(?<![\w\d])(?<unexpected>\.)(?![\w\d])/, 'Unexpected'], // TODO: Add example
    ['UNEXPECTED', /^\b(?<unexpected>[a-zA-Z_]+)\b(?![\(\)\[\];,])/, 'Unexpected'],
];

/**
 * Token specifications for the CAPL tokenizer.
 * Each token is defined by a regular expression pattern and a corresponding token type.
 */

// const tokenSpecs = [
//     // Keywords
//     { type: 'KEYWORD_IF', regex: /\bif\b/ },
//     { type: 'KEYWORD_ELSE', regex: /\belse\b/ },
//     { type: 'KEYWORD_WHILE', regex: /\bwhile\b/ },
//     { type: 'KEYWORD_FOR', regex: /\bfor\b/ },
//     { type: 'KEYWORD_RETURN', regex: /\breturn\b/ },
//     { type: 'KEYWORD_INCLUDES', regex: /\bincludes\b/ },
//     { type: 'KEYWORD_VARIABLES', regex: /\bvariables\b/ },
//     // Add more keywords as needed

//     // Operators
//     { type: 'OPERATOR_ASSIGN', regex: /=/ },
//     { type: 'OPERATOR_EQUAL', regex: /==/ },
//     { type: 'OPERATOR_NOT_EQUAL', regex: /!=/ },
//     { type: 'OPERATOR_LESS_THAN', regex: /</ },
//     { type: 'OPERATOR_GREATER_THAN', regex: />/ },
//     // Add more operators as needed

//     // Delimiters
//     { type: 'DELIMITER_SEMICOLON', regex: /;/ },
//     { type: 'DELIMITER_COMMA', regex: /,/ },
//     { type: 'DELIMITER_OPEN_PAREN', regex: /\(/ },
//     { type: 'DELIMITER_CLOSE_PAREN', regex: /\)/ },
//     { type: 'DELIMITER_OPEN_BRACE', regex: /\{/ },
//     { type: 'DELIMITER_CLOSE_BRACE', regex: /\}/ },
//     // Add more delimiters as needed

//     // Identifiers
//     { type: 'IDENTIFIER', regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },

//     // Literals
//     { type: 'LITERAL_NUMBER', regex: /\b\d+(\.\d+)?\b/ }, // Matches integers and decimals
//     { type: 'LITERAL_STRING', regex: /"(?:\\.|[^"\\])*"/ }, // Matches double-quoted strings
//     // Add more literals as needed

//     // Comments
//     { type: 'COMMENT_SINGLE_LINE', regex: /\/\/.*/ },
//     { type: 'COMMENT_MULTI_LINE', regex: /\/\*[\s\S]*?\*\// },

//     // Whitespace
//     { type: 'WHITESPACE', regex: /\s+/ },
//   ];

//   module.exports = tokenSpecs;
