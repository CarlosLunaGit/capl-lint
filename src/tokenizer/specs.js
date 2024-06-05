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

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()\s*(?<arguments>.*?)?\s*(?<closeParen>\))\s*(?<openCurly>\{)/],

    // ---------------------------------------
    // IF block:

    ['IF', /^(?<ifkey>if)\s*(?<openParen>\()(?<conditional>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))\s*(?<openCurly>\{)/],
    ['ELSE', /^(?<elsekey>else)\s*(?<openCurly>\{)/],
    ['ELSEIF', /^(?<elsekey>else if)\s*(?<opencurlyblock>\{)/],


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

    [null, /^(?<openKey>#)(?<keyword>include)\s*(?<dir>".*")/],


    // ---------------------------------------
    // Variable Declaration:

    [null, /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    // ---------------------------------------
    // Function Call:

    [null, /^(?<name>\w+) ?(?<openParen>\()\s*(?<arguments>.*?)\s*(?<closeParen>\))(?<semicolon>;)?/],


    // ---------------------------------------
    // Return Statement:

    ['RETURN', /^(?<returnStatement>return)\s*(?<semicolon>;?)/],

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
    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")\s*(?<semicolon>;)?/],


    // ---------------------------------------
    // Initialization Statement:

    ['INITIALIZATIONSTATEMENT', /^(?<variable>.+)\s*(?<equals>=)\s*(?<value>[^;]+)\s*(?<semicolon>;*)?/],

    // ---------------------------------------
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    ['VARIABLEDECLARATION', /^(?<structKeyword>struct) +(?<type>\w+) +(?<name>\w+)(?<semicolon>;)/],


    // ---------------------------------------
    // Function Call:

    ['FUNCTIONCALL', /^(?<name>\w+) ?(?<openParen>\()\s*(?<arguments>.*?)\s*(?<closeParen>\))(?<semicolon>;)?/],

    // ---------------------------------------
    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})/],

            // ---------------------------------------
    // Blocks
    // FunctionBlock:

    ['FUNCTIONSBLOCK', /^(?<dataType>(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)\s*(?:\[\])?)\s*(?<name>\w+)\s*(?<openParen>\()?\s*(?<arguments>.*?)?\s*(?<closeParen>\))?\s*(?<openCurly>\{)/],

]

export const functionsSpec = [



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
    // IF block:

    ['IF', /^(?<ifkey>if)\s*(?<openParen>\()(?<conditional>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))\s*(?<openCurly>\{)/],
    ['ELSE', /^(?<elsekey>else)\s*(?<opencurlyblock>\{)/],
    ['ELSEIF', /^(?<elsekey>else if)\s*(?<opencurlyblock>\{)/],


    // ---------------------------------------
    // #Includes:

    ['INCLUDE', /^(?<openKey>#)?(?<keyword>include)?\s*(?<dir>".*")\s*(?<semicolon>;)?/],


    // ---------------------------------------
    // Variable Declaration:

    ['VARIABLEDECLARATION', /^(?<modifier>var|const)? ?(?<dataType>void|int|long|float|double|char|byte|word|dword|int64|gword) +(?<name>\w+) ?(?<arraySize>\[.*\])? *(?<assigment>=)? *(?<value>[^;\s]+)?(?<semicolon>;)?/],

    // ---------------------------------------
    // Initialization Statement:

    ['INITIALIZATIONSTATEMENT', /^(?<variable>.+)\s*(?<equals>=)\s*(?<value>[^;]+)\s*(?<semicolon>;*)?/],

    // ---------------------------------------
    // Function Call:

    ['FUNCTIONCALL', /^(?<name>\w+)\s*(?<openParen>\()(?<arguments>(?:[^()]*\([^()]*\))*[^()]*)\s*(?<closeParen>\))(?<semicolon>;?)/],

    // ---------------------------------------
    // Closing block:

    ['CLOSINGBLOCK', /^(?<closeCurly>\})/],

    // ---------------------------------------
    // Return Statement:

    ['RETURN', /^(?<returnStatement>return)\s*(?<semicolon>;?)/],




]