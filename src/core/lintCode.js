// async function lintCode(code) {
//     // Simple implementation: Check if all lines end with a semicolon
//     // const preprocessedCode = preprocessCode(code);
//     const lines = code.split('\\r\\n');
//     console.log(lines);

//     const errors = [];
//     lines.forEach((line, index) => {
//         if (!line.trim().endsWith(';')) {
//             errors.push({ line: index + 1, error: 'Line does not end with a semicolon.' });
//         }
//     });

//     console.log(errors);
//     return errors;
// }
const dataTypes = ['byte', 'int', 'char', 'float', 'double', 'long', 'short']; // Extend this list as needed

function preprocessCode(input) {
    // Normalize newlines and decode escape sequences
    let normalized = input.replace(/\\r\\n/g, '\n').replace(/\\"/g, '"');
    // Remove block comments
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments
    return normalized.replace(/\/\/.*$/gm, '');
}

async function lintCode(sourceCode) {
    const preprocessedCode = preprocessCode(sourceCode)
    const lines = preprocessedCode.split('\n');
    const lintErrors = [];

    lines.forEach((line, index) => {
        // Check for semicolon at the end of the line if it's not an empty line, comment, or block start/end
        // if (line.trim() && !line.trim().startsWith('//') && !line.match(/^\s*[\{\}]\s*$/)) {
        //     if (!line.trim().endsWith(';')) {
        //         lintErrors.push(`Lint warning: Line ${index + 1} should end with a semicolon.`);
        //     }
        // }
        let trimmedLine = line.trim();
        if (!trimmedLine) {
            return;
        }
        // Extract the first word to determine the data type
        const firstWord = trimmedLine.split(/\s+/)[0];
        if (dataTypes.includes(firstWord) && !trimmedLine.endsWith(';')) {
            lintErrors.push(`Lint warning: Variable declaration in line ${index + 1} should end with a semicolon. Statement: - ${trimmedLine}`);
        }
    });

    return lintErrors;
}




module.exports = {
    lintCode
}