const { lintCode } = require('../../src/core/lintCode');

test('lintCode detects missing semicolons for Variables declaration', async () => {
    const inputCode =
    `variables
    {
        byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};
        byte EE01_RESPONSE[3]={0x62,0xEE,0x01}
        int x = 10;
        int y = 20
    }`;
    const expectedErrors = [
        { line: 4, error: 'Variable declaration should end with a semicolon. Statement: - byte EE01_RESPONSE[3]={0x62,0xEE,0x01}' },
        { line: 6, error: 'Variable declaration should end with a semicolon. Statement: - int y = 20' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
});

test('lintCode detects missing semicolons for Variables declaration (with Comment lines)', async () => {
    const inputCode =
    `/**
    * @var Doxygen comment
    * @brief This is a classic Doxygen compliance comment block
    */
    variables
    {
        byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};
        byte EE01_RESPONSE[3]={0x62,0xEE,0x01}
        int x = 10;
        int y = 20
    }`;
    const expectedErrors = [
        { line: 8, error: 'Variable declaration should end with a semicolon. Statement: - byte EE01_RESPONSE[3]={0x62,0xEE,0x01}' },
        { line: 10, error: 'Variable declaration should end with a semicolon. Statement: - int y = 20' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
});

test('lintCode detects not allowed statements within INCLUDES Block', async () => {
    const inputCode =
    `includes
    {
        // Comment
        #include "..\\TestLibraries\\responses.cin"
        #include "..\\TestLibraries\\utils.cin"
        byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};

    }`;
    const expectedErrors = [
        { line: 6, error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
});

test('lintCode detects not allowed statements within VARIABLES Block', async () => {
    const inputCode =
    `variables
    {
        byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};
        // Comment
        byte EE01_RESPONSE[3]={0x62,0xEE,0x01}
        int x = 10;
        int y = 20
        #include "..\\TestLibraries\\utils.cin"
    }`;
    const expectedErrors = [
        { line: 5, error: 'Variable declaration should end with a semicolon. Statement: - byte EE01_RESPONSE[3]={0x62,0xEE,0x01}' },
        { line: 7, error: 'Variable declaration should end with a semicolon. Statement: - int y = 20' },
        { line: 8, error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\TestLibraries\\utils.cin"' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
})