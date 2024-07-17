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
    ['ELSE', /^(?<elsekey>else)\s*(?<openCurly>\{)/, 'elseCall'],
    ['ELSEIF', /^(?<elseifkey>else if)\s*(?<openParen>\()(?<conditional>(?:[^()]|\((?:[^()]|\([^()]*\))*\))*?)\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'elseIfCall'],

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

    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+)(?<arraySize>(?:\[\d+\])*)? *(?<assigment>=)? *(?<value>(?:\{[^}]*\}|[^;\s]+))?(?<semicolon>;)?/, 'VariableDeclaration'],
    ['VARIABLEDECLARATION_ENUM', /^(?<enumKeyword>enum) +(?<enumType>\w+) +(?<name>\w+) *(?<arrayStart>\[)?(?<arraySize>\d+)?(?<arrayEnd>\])?(?<semicolon>;)?/, 'VariableDeclarationEnum'],
    ['VARIABLEDECLARATION_STRUCT', /^(?<structKeyword>struct) +(?<dataType>\w+) +(?<name>\w+) *(?<arrayStart>\[)?(?<arraySize>\d+)?(?<arrayEnd>\])?(?<semicolon>;)?/, 'VariableDeclarationStruct'],
    ['VARIABLEDECLARATION_STRUCTARRAY', /^(?<structKeyword>struct)\s+(?<structType>\w+)\s*\{\s*(?<structBody>[^}]+)\}\s*(?<variableName>\w+)(?:\[(?<arraySize>\d+)\])\s*(?<semicolon>;)?/, 'VariableDeclarationStructArray'],

    // System Variable declaration:

    ['SYSVARINITIALIZATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<assignment>=)\s*(?<value>[^;]+)?(?<semicolon>;)?/, 'SysvarInitialization'],
    ['SYSVARDECLARATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<semicolon>;)?/, 'SysvarDeclaration'],

    // Function Call:

    // ['FUNCTIONCALL', /^(?<name>\w+)\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/],
    ['FUNCTIONCALL', /^(?<name>(?:(?!\bif\b|\belse\b)\b\w+\b))\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/, 'FunctionCall'],

    // Initialization Statement:

    ['INITIALIZATIONSTATEMENT_ARRAYELEMENT', /^(?<variable>\w+)\[(?<index>\d+)\]\s*=\s*(?<value>[^;]+)(?<semicolon>;)?/, 'InitializationStatementArrayElement'],
    ['INITIALIZATIONSTATEMENT_TERNARY', /^(?<variable>\w+)\s*=\s*(?<condition>.+?)\s*\?\s*(?<trueValue>.+?)\s*:\s*(?<falseValue>.+?)(?<semicolon>;)?/, 'InitializationStatementTernary'],
    ['INITIALIZATIONSTATEMENT_FUNCTIONCALL', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<functionName>\w+)\((?<arguments>[^;]*)\)(?<semicolon>;)?/, 'InitializationStatementFunctionCall'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\(.*\)\s*\+\s*0x[\da-fA-F]+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\s*\+\s*\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\s*\-\s*\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\.\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\w+\[\w+\]\.\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>\w+\.\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    // ^(?<variable>\w+)\s*=\s*(?<expression>.+?)(?<semicolon>;)?$ // This pattern captures any expression on the right side of the = until an optional semicolon. It's less specific but more flexible.

    // Return Statement:

    ['RETURN', /^(?<returnStatement>return)\s*(?<returnedValue>[^;]*)?\s*(?<semicolon>;)?/, 'ReturnStatement'],

    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})\s*(?<semicolon>;)?/, 'ClosingBlock'],

    // Unexpected:

    ['UNEXPECTED', /^(?<![\w\d])(?<unexpected>\.)(?![\w\d])/, 'Unexpected'],
    ['UNEXPECTED', /^\b(?<unexpected>[a-zA-Z_]+)\b(?![\(\)\[\];,])/, 'Unexpected'],
];
