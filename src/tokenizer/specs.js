/**
 * Tokenizer spec.
 */
export const blocksSpec = [

    // ---------------------------------------
    // Blocks
    // IncludesBlock:

    ['INCLUDESBLOCK', /^(?<name>includes)(?:\s*)?(?<openCurly>\{)?(?:\s*)?(?<body>.*?)(?:\s*)?(?<closeCurly>\})?/],

    // VariablesBlock:

    ['VARIABLESBLOCK', /^(?<name>variables)(?:\s*)?(?<openCurly>\{)?(?:\s*)?(?<body>.*?)(?:\s*)?(?<closeCurly>\})?/],

    // FunctionBlock:

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)\s*(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()?\s*(?<arguments>.*?)?\s*(?<closeParen>\))?\s*(?<openCurly>\{)/],


    // ---------------------------------------
    // Whitespace:

    [null, /^\s+/,],

    // ---------------------------------------
    // Comments:

    // Skip single-line comments:
    [null, /^\/\/.*/],

    // Skip multi-line comments:
    [null, /^\/\*[\s\S]*?\*\//],

    // ---------------------------------------
    // Semicolon:

    ['SEMICOLON', /^;+/],

    // ---------------------------------------
    // Numbers:

    ['NUMBER', /^\d+/],

    // ---------------------------------------
    // Strings:

    ['STRING', /^"[^"]*"/],
    ['STRING', /^'[^']*'/],

    // ---------------------------------------
    // #Includes:

    ['INCLUDE', /^(?<openKey>#)(?<keyword>include)\s*(?<dir>".*")/],


    // ---------------------------------------
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    // ---------------------------------------
    // Function Call:

    ['FUNCTIONCALL', /^(?<name>\w+) ?(?<openParen>\()\s*(?<arguments>.*?)\s*(?<closeParen>\))(?<semicolon>;)?/],

    // ---------------------------------------
    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})/],


]

export const includesSpec = [



    // ---------------------------------------
    // Whitespace:

    [null, /^\s+/,],

    // ---------------------------------------
    // Comments:

    // Skip single-line comments:
    [null, /^\/\/.*/],

    // Skip multi-line comments:
    [null, /^\/\*[\s\S]*?\*\//],

    // ---------------------------------------
    // Semicolon:

    ['SEMICOLON', /^;+/],

    // ---------------------------------------
    // Numbers:

    ['NUMBER', /^\d+/],

    // ---------------------------------------
    // Strings:

    ['STRING', /^"[^"]*"/],
    ['STRING', /^'[^']*'/],

        // ---------------------------------------
    // Blocks
    // FunctionBlock:

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)\s*(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()?\s*(?<arguments>.*?)?\s*(?<closeParen>\))?\s*(?<openCurly>\{)/],


    // ---------------------------------------
    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")(?<semicolon>;)?/],


    // ---------------------------------------
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    // ---------------------------------------
    // Function Call:

    ['FUNCTIONCALL', /^(?<name>\w+) ?(?<openParen>\()\s*(?<arguments>.*?)\s*(?<closeParen>\))(?<semicolon>;)?/],

    // ---------------------------------------
    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})/],



]

export const variablesSpec = [



    // ---------------------------------------
    // Whitespace:

    [null, /^\s+/,],

    // ---------------------------------------
    // Comments:

    // Skip single-line comments:
    [null, /^\/\/.*/],

    // Skip multi-line comments:
    [null, /^\/\*[\s\S]*?\*\//],

    // ---------------------------------------
    // Semicolon:

    ['SEMICOLON', /^;+/],

    // ---------------------------------------
    // Numbers:

    ['NUMBER', /^\d+/],

    // ---------------------------------------
    // Strings:

    ['STRING', /^"[^"]*"/],
    ['STRING', /^'[^']*'/],

        // ---------------------------------------
    // Blocks
    // FunctionBlock:

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)\s*(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()?\s*(?<arguments>.*?)?\s*(?<closeParen>\))?\s*(?<openCurly>\{)/],


    // ---------------------------------------
    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")\s*(?<semicolon>;)?/],


    // ---------------------------------------
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    // ---------------------------------------
    // Function Call:

    ['FUNCTIONCALL', /^(?<name>\w+) ?(?<openParen>\()\s*(?<arguments>.*?)\s*(?<closeParen>\))(?<semicolon>;)?/],

    // ---------------------------------------
    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})/],



]