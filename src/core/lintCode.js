const { dataTypes, blockTypes, includesBlock, variablesBlock, functionBlocks } = require('../types/types');
let functionStart = false;

function preprocessCode(input) {
    // Normalize newlines and decode escape sequences
    // let normalized = input.replace(/\\r\\n/g, '\n').replace(/\\"/g, '"');
    let normalized = input.replace(/\\r\\n/g, '\n');
    // Remove block comments
    // normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments
    // return normalized.replace(/\/\/.*$/gm, '');
    return normalized;
}

function serializeLines(lines){
    let serialized = [];

    lines.forEach((line, index) => {

        serialized.push({statement: line, index : index + 1})

    })
    return serialized;
}

function blocksSegregation(lines) {
    let blocks = [];
    let blockStack = [];  // Stack to track nested blocks and their types

    // Define regular expression for detecting function declarations
    const functionPattern = /^\s*(?:testcase|void|int|long|float|double|char|byte|word|dword|int64|gword)\s+\w+\s*\([^)]*\)\s*$/;

    lines.forEach((line, index) => {
        const trimmedLine = line.statement.trim();
        let currentBlockType = blockStack.length > 0 ? blockStack[blockStack.length - 1].type : null;

        // Check for block identifiers and function declarations
        if (blockTypes.includes(trimmedLine.split(/\s+/)[0]) && !trimmedLine.includes('{')) {
            blockStack.push({ type: trimmedLine.split(/\s+/)[0], declarationSeen: false });
        } else if (functionPattern.test(trimmedLine) && !trimmedLine.includes('{')) {
            blockStack.push({ type: 'function', declarationSeen: false }); // Handle function declarations
        } else if (trimmedLine === '{') {
            if (blockStack.length === 0 || blockStack[blockStack.length - 1].open === undefined) {
                blockStack[blockStack.length - 1] = { ...blockStack[blockStack.length - 1], open: true };
            } else {
                blockStack.push({ type: currentBlockType, open: true });
            }
        } else if (trimmedLine === '}') {
            blockStack.pop();
        }

        // Assign the current line to the block type on top of the stack
        blocks.push({
            ...line,
            parentBlock: currentBlockType,
            declarationSeen: blockStack.length > 0 ? blockStack[blockStack.length - 1].declarationSeen : false
        });

        // Update currentBlockType if the blockStack was modified
        if (blockStack.length > 0) {
            currentBlockType = blockStack[blockStack.length - 1]. type;
        }
    });

    return blocks;
}

async function checkVariableDeclaration(line, trimmedLine){

    let errors = [];

    let firstWord = trimmedLine.split(/\s+/)[0];

    if (firstWord === 'const') {
        firstWord = firstWord.concat(' ', trimmedLine.split(/\s+/)[1]);
    }

    if (dataTypes.includes(firstWord) && !trimmedLine.endsWith(';')) {
        errors.push({ line: line.index, error: `Variable declaration should end with a semicolon. Statement: - ${trimmedLine}`});
    }

    return { errors , amount : errors.length};
}

async function checkBlockImplementation(line, trimmedLine) {

    let errors = [];

    let firstWord = trimmedLine.split(/\s+/)[0];

    if (firstWord === 'const') {
        firstWord = firstWord.concat(' ', trimmedLine.split(/\s+/)[1]);
    }

    if (!includesBlock.includes(firstWord) && line.parentBlock == 'includes') {
        errors.push({ line: line.index, error: `INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - ${trimmedLine}`});
    };

    if (!variablesBlock.includes(firstWord) && line.parentBlock == 'variables') {
        errors.push({ line: line.index, error: `VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - ${trimmedLine}`});
    };

    return { errors , amount : errors.length};
}

async function checkDeclarationBlockOrder(block, blocks) {
    let errors = [];
    let nonDeclarationSeen = false;  // To track if any non-declaration statement was seen

    // Filter to get all lines in the current function block if the block is a function type
    if (functionBlocks.includes(block.parentBlock)) {
        const functionBlockLines = blocks.filter(b => b.parentBlock === block.parentBlock);

        for (let line of functionBlockLines) {
            const trimmedLine = line.statement.trim();
            let firstWord = trimmedLine.split(/\s+/)[0];

            if (firstWord === 'const') {
                firstWord = firstWord.concat(' ', trimmedLine.split(/\s+/)[1]);
            }

            // Check if the line is a data type declaration
            if (dataTypes.includes(firstWord)) {
                if (nonDeclarationSeen) {
                    // If non-declaration statements were seen before this declaration
                    errors.push({ line: line.index, error: `Variable declaration should happen at the start of a function block. Statement: - ${trimmedLine}`});
                }
            } else if (firstWord !== ''){
                // Any statement that's not a declaration sets this flag
                nonDeclarationSeen = true;
            }
        }
    }

    return { errors, amount: errors.length };
}

async function checkFunctionParameters(line, trimmedLine) {
    let errors = [];

    // Regular expression to capture potential function declarations
    // This regex looks for typical C-style function headers, potentially useful for your specific codebase syntax
    const functionRegex = /^\s*(?:testcase|void|int|char|float|double|byte|struct\s+\w+)\s+(\w+)\s*\(([^)]*)\)/;
    const match = trimmedLine.match(functionRegex);

    // Check if the current line matches a function declaration
    if (match) {
        const functionName = match[1];
        const parameters = match[2];

        // Split parameters on commas
        const params = parameters.split(',');

        // Check for missing commas by inspecting each parameter split
        // If a split contains more than one type without intervening commas, it's likely an error
        params.forEach((param, index) => {
            const paramTrim = param.trim();
            // Count the number of basic types or struct declarations, if more than 1 and no commas, it's likely an error
            const typeCount = (paramTrim.match(/\b(byte|int|char|float|double|struct|enum)\b/g) || []).length;
            if (typeCount > 1) {
                errors.push({
                    line: line.index,
                    error: `Missing comma to separate parameters in function declaration. Statement: - ${functionName}(${parameters})`
                });
            }
        });
    }

    return { errors, amount: errors.length };
}



function cleanUpBlocks(blocks) {
    // Iterate over each block in the array
    blocks.forEach(block => {
        // Trim whitespace and check if the statement is just '{' or '}'
        const trimmedStatement = block.statement.trim();
        if (trimmedStatement === '{' || trimmedStatement === '}') {
            // Set parentBlock to null if the condition is met
            block.parentBlock = null;
        }

    });

    return blocks;
}

async function lintCode(sourceCode) {
    const preprocessedCode = preprocessCode(sourceCode);
    const lines = preprocessedCode.split('\n');
    const serializedLines = serializeLines(lines);
    const cleanedBlocks = blocksSegregation(serializedLines);
    const blocks = cleanUpBlocks(cleanedBlocks);
    let lintErrors = [];

    // Use a set to track which function blocks have been checked
    let checkedFunctionBlocks = new Set();

    for (let block of blocks) {
        let trimmedLine = block.statement.trim();

        let variableCheck = await checkVariableDeclaration(block, trimmedLine);
        if (variableCheck.errors.length > 0) {
            lintErrors = lintErrors.concat(variableCheck.errors);
        }

        let blockCheck = await checkBlockImplementation(block, trimmedLine);
        if (blockCheck.errors.length > 0) {
            lintErrors = lintErrors.concat(blockCheck.errors);
        }

        // Check declaration block order only once per function block
        if (functionBlocks.includes(block.parentBlock) && !checkedFunctionBlocks.has(block.parentBlock)) {
            let orderCheck = await checkDeclarationBlockOrder(block, blocks);
            if (orderCheck.errors.length > 0) {
                lintErrors = lintErrors.concat(orderCheck.errors);
            }
            checkedFunctionBlocks.add(block.parentBlock);
        }

        let functionParametersCheck = await checkFunctionParameters(block, trimmedLine);
        if (functionParametersCheck.errors.length > 0) {
            lintErrors = lintErrors.concat(functionParametersCheck.errors);
        }
    }

    return lintErrors;
}





module.exports = {
    lintCode
}