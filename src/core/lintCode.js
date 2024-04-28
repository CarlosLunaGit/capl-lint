async function lintCode(code) {
    // Simple implementation: Check if all lines end with a semicolon
    const lines = code.split('\\n');
    console.log(lines);

    const errors = [];
    lines.forEach((line, index) => {
        if (!line.trim().endsWith(';')) {
            errors.push({ line: index + 1, error: 'Line does not end with a semicolon.' });
        }
    });

    console.log(errors);
    return errors;
}

module.exports = {
    lintCode
}