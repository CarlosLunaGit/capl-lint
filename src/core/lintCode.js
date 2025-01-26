import { dataTypes, blockTypes, includesBlock, standaloneKeyWords, variablesBlock, functionBlocks, commentsKeyWords } from '../types/types';

import * as stringOps from '../utils/strings';
import * as identifier from '../utils/identifier';


function preprocessCode(input) {

    let normalized = input.replace(/\\r\\n/g, '\n');

    return normalized;
}

function serializeLines(lines){
    let serialized = [];

    lines.forEach((line, index) => {

        serialized.push({statement: line, index : index + 1})

    })
    return serialized;
}

/**
 * Segregates blocks in the provided lines of code.
 * @param {Array<{ statement: string, index: number }>} lines - Array of lines of code.
 * @returns {Array<{ statement: string, index: number, parentBlock: string | 'notApplicable', declarationSeen: boolean }>} - Segregated blocks.
 */
function blocksSegregation(lines) {
    const blocks = [];
    const blockStack = []; // Stack to track nested blocks and their types

    /**
     * Regular expression for detecting function declarations and block headers.
     * This regex is updated to match block headers and function declarations.
     */
    const blockPattern = /(?:(\/\*.*|includes|variables) ?(?:({))?|(testcase|void|int|long|float|double|char|byte|word|dword|int64|gword).* (?:(\w+)) ?(\([^)]*\)) ?(?:({))?|(for|while|do|if|else) ?(\([^)]*\))? ?(?:({))?|(?:(\w+)) ?(\([^)]*\)))/;

    lines.forEach((line, index) => {
        const trimmedLine = line.statement.trim();
        let currentBlockType = blockStack.length > 0 ? blockStack[blockStack.length - 1].type : 'notApplicable';

        // Check for block headers and function declarations
        const match = trimmedLine.match(blockPattern);
        if (match) {
            const [_,
                blockType,
                hasOpeningBracketBlockType,
                functionDeclarationType,
                functionDeclarationName,
                functionParameters,
                hasOpeningBracketFunctionType,
                controlStructureType,
                controlStructureParameters,
                hasOpeningBracketControlStructureType,
                functionCallType,
                functionCallParameters] = match;

            const isOpeningBracketInline = (
                hasOpeningBracketBlockType === '{' ||
                hasOpeningBracketFunctionType === '{' ||
                hasOpeningBracketControlStructureType === '{');

            const isFunctionDeclaration = !!functionDeclarationType;
            const isControlStructure = !!controlStructureType;
            const isFunctionCall = !!functionCallType;
            const blockName = isFunctionDeclaration ? 'function' : isControlStructure ? controlStructureType : isFunctionCall ? 'functionCall' : blockType;

            // Determine the parent block based on nesting level
            let parentBlock = currentBlockType;

            if (blockStack.length == 0 ) {
                parentBlock = blockName;
            }

            if (blockStack.length > 0 && isOpeningBracketInline) {
                parentBlock = currentBlockType ? `${currentBlockType}_withOpening` : 'notApplicable';
            }

            // Handle nested blocks
            if (blockStack.length > 0 && !isOpeningBracketInline) {
                let nestedLevel = 1;
                while (nestedLevel < blockStack.length && blockStack[blockStack.length - nestedLevel].type === blockName) {
                    nestedLevel++;
                }
                parentBlock = `${blockName}_${nestedLevel}`;
            }
            if (_.match(/\/\*.*/)) {

                blocks.push({ ...line, parentBlock: 'notApplicable', declarationSeen: !isOpeningBracketInline });
            }else{

                blockStack.push({ type: blockName, declarationSeen: !isOpeningBracketInline });
                blocks.push({ ...line, parentBlock, declarationSeen: !isOpeningBracketInline });
            }

        } else if (trimmedLine === '}') {
            blockStack.pop();
            blocks.push({ ...line, parentBlock: 'notApplicable', declarationSeen: false });
        } else {
            // Assign the current line to the block type on top of the stack

            if (blockStack.length) {
                let nestedLevel = 1;
                while (nestedLevel < blockStack.length && blockStack[blockStack.length - nestedLevel].type === currentBlockType) {
                    nestedLevel++;
                }
                currentBlockType = `${currentBlockType}_${nestedLevel}`;
            }

            blocks.push({
                ...line,
                parentBlock: currentBlockType,
                declarationSeen: blockStack.length > 0 ? blockStack[blockStack.length - 1].declarationSeen : false,
            });
        }
    });

    return blocks;
}


async function checkVariableDeclaration(line, trimmedLine, context) {
    let errors = [];
    let firstWord = trimmedLine.split(/\s+/)[0];
    let declarationEnd = trimmedLine.endsWith(';');

    // Handling 'const' and other multi-word data types
    if (firstWord === 'const') {
        firstWord = firstWord.concat(' ', trimmedLine.split(/\s+/)[1]);
    }

    try {
        // Check if we are in a declaration block (like struct)
        if ((context.isInDeclarationBlock || (dataTypes.includes(firstWord) || (firstWord==='}' && line.parentBlock !== 'notApplicable'))) && !trimmedLine.includes('(')) {
            // Check if the declaration starts a block with '{'
            if (trimmedLine.includes('{')) {
                context.isInDeclarationBlock = true;
            }

            // Check if the current block (if any) ends
            if (trimmedLine.includes('}') && trimmedLine !== '}') {
                // Assume the declaration should end with ';'
                if (!declarationEnd) {
                    errors.push({
                        line: line.index,
                        error: `Variable Declaration BLOCK should end with a semicolon. Statement: - ${trimmedLine}`,
                        type: 'Error',
                        priority: 1});
                }
                context.isInDeclarationBlock = false;
            } else if (!context.isInDeclarationBlock && !declarationEnd) {
                // Single line declaration must end with semicolon
                errors.push({
                    line: line.index,
                    error: `Variable declaration should end with a semicolon. Statement: - ${trimmedLine}`,
                    type: 'Error',
                    priority: 1});
            }
        }
    } catch (error) {
        console.log(error);
    }


    return { errors: [...errors], context };
}


async function checkBlockImplementation(line, trimmedLine) {

    let error = [];

    let firstWord = trimmedLine.split(/\s+/)[0];

    if (firstWord === 'const') {
        firstWord = firstWord.concat(' ', trimmedLine.split(/\s+/)[1]);
    }

    try {

        if (!includesBlock.includes(firstWord) && line.parentBlock.includes('includes')) {
            error.push({
                line: line.index,
                error: `INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - ${trimmedLine}`,
                type: 'Error',
                priority: 1});
        };

        if (!variablesBlock.includes(firstWord) && line.parentBlock.includes('variables')) {
            error.push({
                line: line.index,
                error: `VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - ${trimmedLine}`,
                type: 'Error',
                priority: 1});
        };

    } catch (error) {
        console.log(error);
    }



    return [...error];
}

async function checkSemicolonUsage(line, trimmedLine){
    let error = [];

    let firstWord = trimmedLine.split(/\s+/)[0];

    if (!line.statement.endsWith(';') && !line.statement.endsWith('}') &&
        !trimmedLine.startsWith('//') && trimmedLine !== '' &&
        !standaloneKeyWords.includes(firstWord) && !dataTypes.includes(firstWord) &&
        !blockTypes.includes(firstWord) && !commentsKeyWords.includes(firstWord) &&
        !line.statement.includes('/*') && !line.parentBlock.includes('function')) {
        error.push({
            line: line.index,
            error: `Line statement should end with a semicolon. Statement: - ${trimmedLine}`,
            type: 'Error',
            priority: 1
        });
    }

    return [...error];
}

async function checkInlineCurlyBrackets(line, trimmedLine){

    let error = [];

    let firstWord = trimmedLine.split(/\s+/)[0];

    if (firstWord.match(/\b(for|while|do|if|else|variables)/) && !line.statement.includes('{')) {
        error.push({
            line: line.index,
            error: `Opening curly bracket must be on the same line as the keyword for control structures. Statement: - ${trimmedLine}`,
            type: 'Format Rules (Clang)',
            priority: 2
        });
    }

    return [...error];
}



async function checkDeclarationBlockOrder(line, trimmedLine, context) {
    let errors = [];
    let firstWord = trimmedLine.split(/\s+/)[0];

    // Check if the current line is within a function block
    if (trimmedLine.includes('{')) {
        // If a function block is encountered, reset the context
        context.isInDeclarationBlock = true;
    }

    if (trimmedLine.includes('}')) {
        // If a function block is encountered, reset the context
        context.isInDeclarationBlock = false;
    }


    // Check if the line contains a variable declaration
    if (functionBlocks.filter((e) => {return line.parentBlock.includes(e);}).length > 0  &&
    dataTypes.includes(firstWord) && line.parentBlock !== 'function' && line.parentBlock !== 'notApplicable' ) {
        // If a variable declaration is encountered and it's not the first line in the block
        if (!context.isInDeclarationBlock) {
            errors.push({
                line: line.index,
                error: `Variable declarations must be the first lines within curly brackets of a block. Statement: - ${trimmedLine}`,
                type: 'Error',
                priority: 1
            });
        }
        context.isInDeclarationBlock = true;
    } else if (!trimmedLine.includes('{') && trimmedLine !== ('')){
        // If the line is not a variable declaration, update the context
        context.isInDeclarationBlock = false;
    }

    return { errors: [...errors], context };
}


async function checkFunctionParameters(line, trimmedLine) {
    let error = [];

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
                error.push({
                    line: line.index,
                    error: `Missing comma to separate parameters in function declaration. Statement: - ${functionName}(${parameters})`,
                    type: 'Error',
                    priority: 1
                });
            }
        });
    }

    return [...error];
}

async function checkFunctionTypes(line, trimmedLine) {
    let error = [];

    // Regular expression to capture potential function declarations
    // This regex looks for typical C-style function headers, potentially useful for your specific codebase syntax
    const errorTypeArray = /^\s*(?:testcase|void|int|char|float|double|byte|struct\s+\w+)(..)\s+(\w+)\s*\(([^)]*)\)/;
    const match = trimmedLine.match(errorTypeArray);

    // Check if the current line matches a function declaration
    if (match) {
        const functionName = match[0];
        const errorType = match[1];

                if (errorType.includes('[]')) {
                    error.push({
                        line: line.index,
                        error: `Function declaration CANNOT be of type ARRAY, use Referenced variables to return array types. Statement: - ${functionName}`,
                        type: 'Error',
                        priority: 1
                    });
                }


    }

    return [...error];
}


function cleanUpBlocks(blocks) {
    // Iterate over each block in the array
    blocks.forEach(block => {
        // Trim whitespace and check if the statement is just '{' or '}'
        const trimmedStatement = block.statement.trim();
        if (trimmedStatement === '{' || trimmedStatement === '}') {
            // Set parentBlock to 'notApplicable' if the condition is met
            block.parentBlock = 'notApplicable';
        }

    });

    return blocks;
}

// Critical Compliance Rules
async function checkCriticalRules(blocks) {
    let errors = [];
    let trimmedLine;
    let results;
    let context = { isInDeclarationBlock: false };

    for (let index = 0; index < blocks.length; index++) {
        let line = blocks[index];

        trimmedLine = line.statement.trim();
        trimmedLine = stringOps.removeInlineComments(trimmedLine);

        results = await checkBlockImplementation(line, trimmedLine);

        if (results.length > 0) {
            errors.push( results[0] );
        }

        results = await checkSemicolonUsage(line, trimmedLine);

        if (results.length > 0) {
            errors.push( results[0] );
        }

        results = await checkVariableDeclaration(line, trimmedLine, context);

        if (results.errors.length > 0) {
            context = results.context;
            errors.push( results.errors[0] );
        }

        results = await checkDeclarationBlockOrder(line, trimmedLine, context);

        if (results.errors.length > 0) {
            context = results.context;
            errors.push( results.errors[0] );
        }

        results = await checkFunctionParameters(line, trimmedLine);

        if (results.length > 0) {
            errors.push( results[0] );
        }

        results = await checkFunctionTypes(line, trimmedLine);

        if (results.length > 0) {
            errors.push( results[0] );
        }

    }

    return [...errors];
}

// Clang Format and Other Middle-priority Rules
async function checkClangFormatRules(blocks) {
    let errors = [];
    let trimmedLine;
    let results;

    for (let index = 0; index < blocks.length; index++) {
        let line = blocks[index];
        trimmedLine = line.statement.trim();

        results = await checkInlineCurlyBrackets(line, trimmedLine);

        if (results.length > 0) {
            errors.push( results[0] );
        }
    }

    return [...errors];
}

// Style Rules
async function checkStyleRules(blocks) {
    let errors = [];
    let trimmedLine;
    let results;


    // for (let index = 0; index < blocks.length; index++) {
    //     let line = blocks[index];
    //     trimmedLine = line.statement.trim();

    //     results = await checkInlineCurlyBrackets(line, trimmedLine);

    //     if (results.length > 0) {
    //         errors.push( results[0] );
    //     }
    // }

    return [...errors];
}

async function testTypesIdentifier(blocks) {
    let errors = [];
    let trimmedLine;
    let results;


    for (let index = 0; index < blocks.length; index++) {
        let line = blocks[index];
        trimmedLine = line.trim();

        results = await identifier.identifyCAPLStatementTypes(trimmedLine);

        // results === undefined ? [] : results[0];
        errors.push( results[0] );

    }

    return [...errors];
}


async function lintCode(sourceCode) {
    const preprocessedCode = preprocessCode(sourceCode);
    const lines = preprocessedCode.split('\n');
    const serializedLines = serializeLines(lines);
    const cleanedBlocks = blocksSegregation(serializedLines);
    const blocks = cleanUpBlocks(cleanedBlocks);
    // let lintErrors = [];
    // let context = { isInDeclarationBlock: false };
    let criticalErrors;
    let clangErrors;
    let styleErrors

        criticalErrors = await checkCriticalRules(blocks);
        // Stop further checks if critical C11 compliance errors are found
        if (criticalErrors.length > 0) {
            return criticalErrors;  // Optionally return here to focus on critical issues
        }

        clangErrors = await checkClangFormatRules(blocks);
        // Could also decide to stop after formatting errors, if they are considered severe enough
        // if (clangErrors.length > 0 && config.stopOnFormattingErrors) {
        if (clangErrors.length > 0) {
            return [...criticalErrors, ...clangErrors];
        }

        styleErrors = await checkStyleRules(blocks);

    return [...criticalErrors, ...clangErrors, ...styleErrors];
}

async function identicationTypesTest(sourceCode) {

    let lines = sourceCode.split('\n');
    let testTypes = await testTypesIdentifier(lines);

    return [...testTypes];
}


export default {
    lintCode,
    identicationTypesTest
}