function lintCode(code) {
    // Simple implementation: Check if all lines end with a semicolon
    const lines = code.split('\n');
    const errors = [];
    lines.forEach((line, index) => {
        if (!line.trim().endsWith(';')) {
            errors.push({ line: index + 1, error: 'Line does not end with a semicolon.' });
        }
    });
    return errors;
}

module.exports = {
    lintCode
}