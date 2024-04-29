const { dataTypes, blockTypes, includesBlock, variablesBlock } = require('../types/types');

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

function blocksSegregration(lines) {
    let blocks = [];

    let i,j;
    let firstWord;

    for (i = 0; i < lines.length; i++) {

        for (j = 0; j < blockTypes.length; j++) {
            if (lines[i].statement.trimStart().startsWith(blockTypes[j])) {
                firstWord = blockTypes[j];
                break;
            }
        }
        blocks.push({...lines[i], parentBlock: firstWord});
    }

    return blocks;
}

async function checkVariableDeclaration(line, trimmedLine){

    let errors = [];

    const firstWord = trimmedLine.split(/\s+/)[0];

    if (dataTypes.includes(firstWord) && !trimmedLine.endsWith(';')) {
        errors.push({ line: line.index, error: `Variable declaration should end with a semicolon. Statement: - ${trimmedLine}`});
    }

    return { errors , amount : errors.length};
}

async function checkBlockImplementation(line, trimmedLine) {

    let errors = [];

    const firstWord = trimmedLine.split(/\s+/)[0];

    if (!includesBlock.includes(firstWord) && line.parentBlock == 'includes') {
        errors.push({ line: line.index, error: `INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - ${trimmedLine}`});
    };

    if (!variablesBlock.includes(firstWord) && line.parentBlock == 'variables') {
        errors.push({ line: line.index, error: `VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - ${trimmedLine}`});
    };

    return { errors , amount : errors.length};
}

async function lintCode(sourceCode) {
    const preprocessedCode = preprocessCode(sourceCode)
    const lines = preprocessedCode.split('\n');
    const serializedLines = serializeLines(lines);

    const blocks = blocksSegregration(serializedLines);

    console.log(blocks);

    let lintErrors = [];
    let buffer;

    for (let i = 0; i < blocks.length; i++) {

        let trimmedLine = blocks[i].statement.trim();

        buffer = await checkVariableDeclaration(blocks[i], trimmedLine);
        if (buffer.amount != 0) {
            lintErrors = lintErrors.concat(buffer.errors);

        };

        buffer = await checkBlockImplementation(blocks[i], trimmedLine);
        if (buffer.amount != 0) {
            lintErrors = lintErrors.concat(buffer.errors);

        };

    }

    console.log(lintErrors);
    return lintErrors;
}




module.exports = {
    lintCode
}