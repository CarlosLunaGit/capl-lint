const { lintCode } = require('../../src/core/lintCode');

test('lintCode detects missing semicolons', () => {
    const inputCode = 'int x = 10\nint y = 20';
    const expectedErrors = [
        { line: 1, error: 'Line does not end with a semicolon.' },
        { line: 2, error: 'Line does not end with a semicolon.' }
    ];
    expect(lintCode(inputCode)).toEqual(expectedErrors);
});
