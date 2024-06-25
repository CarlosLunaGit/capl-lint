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

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()\s*(?<arguments>.*?)?\s*(?<closeParen>\))\s*(?<openCurly>\{)/, 'FunctionsBlock'],

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
    [null, /^\/\*[\s\S]*?\*\//, 'CommentMultiline'],

    // Semicolon:

    ['SEMICOLON', /^;+/, 'Semicolon'],

    // Numbers:

    ['NUMBER', /^\d+/, 'Number'],

    // Strings:

    ['STRING', /^"[^"]*"/, 'StringDoubleQuote'],
    ['STRING', /^'[^']*'/, 'StringSingleQuote'],

    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")(?<semicolon>;)?/, 'IncludeStatement'],

    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+)(?<arraySize>(?:\[\d+\])*)? *(?<assigment>=)? *(?<value>(?:\{[^}]*\}|[^;\s]+))?(?<semicolon>;)?/, 'VariableDeclaration'],
    ['VARIABLEDECLARATION_STRUCT', /^(?<structKeyword>struct) +(?<dataType>\w+) +(?<name>\w+) *(?<arrayStart>\[)?(?<arraySize>\d+)?(?<arrayEnd>\])?(?<semicolon>;)?/, 'VariableDeclarationStruct'],

    // System Variable declaration:

    ['SYSVARINITIALIZATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<assignment>=)\s*(?<value>[^;]+)?(?<semicolon>;)?/, 'SysvarInitialization'],
    ['SYSVARDECLARATION', /^(?<prefix>@)?(?<sysvarKey>sysvar|sysvarInt|sysvarLongLong|sysvarFloat|sysvarString|sysvarIntArray|sysvarFloatArray|sysvarData)\s*::\s*(?<namespace>\w+)\s*::\s*(?<name>\w+)\s*(?<semicolon>;)?/, 'SysvarDeclaration'],

    // Function Call:

    // ['FUNCTIONCALL', /^(?<name>\w+)\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/],
    ['FUNCTIONCALL', /^(?<name>(?:(?!\bif\b|\belse\b)\b\w+\b))\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/, 'FunctionCall'],
    // Initialization Statement:

    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\s*\+\s*\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+\.\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+\.\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'],
    ['INITIALIZATIONSTATEMENT', /^(?<variable>\w+)\s*(?<equals>=)\s*(?<value>[^;]\w+)(?<semicolon>;)?/, 'InitializationStatement'],

    // Return Statement:

    ['RETURN', /^(?<returnStatement>return)\s*(?<semicolon>;?)/, 'ReturnStatement'],

    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})\s*(?<semicolon>;)?/, 'ClosingBlock'],
];
