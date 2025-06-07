export const commonitems = [

    // Delimiters
    { type: 'DELIMITER_SEMICOLON', regex: /^;/ },
    { type: 'DELIMITER_COMMA', regex: /^,/ },
    { type: 'DELIMITER_OPEN_PAREN', regex: /^\(/ },
    { type: 'DELIMITER_CLOSE_PAREN', regex: /^\)/ },
    { type: 'DELIMITER_OPEN_BRACE', regex: /^\{/ },
    { type: 'DELIMITER_CLOSE_BRACE', regex: /^\}/ },
    { type: 'DELIMITER_OPEN_BRACKET', regex: /^\[/ },
    { type: 'DELIMITER_CLOSE_BRACKET', regex: /^\]/ },
    { type: 'DELIMITER_DOT', regex: /^\./ },
    { type: 'DELIMITER_DOUBLE_COLON', regex: /^::/ },
    { type: 'DELIMITER_COLON', regex: /^:/ },

    // Hexadecimal number representation
    { type: 'LITERAL_HEXADECIMAL', regex: /^0[xX][0-9a-fA-F]+/ }, // Matches hexadecimal numbers

    // Identifiers
    { type: 'IDENTIFIER', regex: /^\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },

    // Literals
    { type: 'LITERAL_NUMBER', regex: /^\b\d+(\.\d+)?\b/ }, // Matches integers and decimals
    { type: 'LITERAL_STRING', regex: /^"(?:\\.|[^"\\])*"/ }, // Matches double-quoted strings
    // Add more literals as needed

    // Comments
    { type: 'COMMENT_ENCODING', regex: /^\/\*@.*/ },
    { type: 'COMMENT_SINGLE_LINE', regex: /^\/\/.*/ },
    { type: 'COMMENT_MULTI_LINE', regex: /^\/\*[\s\S]*?\*\// },

    // Whitespace
    { type: 'WHITESPACE', regex: /^\s+/ },

];



