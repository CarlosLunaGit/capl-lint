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

test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION.', async () => {
    const inputCode =
    `/*@!Encoding:1252*/
    includes
    {

    }

    variables
    {


    }

    void MainTest ()
    {
        int x = 10;
        int y = 20;
        int z;
        z = x + y;
        // some comments
        if (1){
          write("%d",z);
      		int w = 10;
      		write("%d",w);
	      }

    }`;
    const expectedErrors = [
        { line: 22, error: 'Variable declaration should happen at the start of a function block. Statement: - int w = 10;' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
})



test('lindCode detects declaration of local variables not at the beginning portion of the TESTCASE.', async () => {
    const inputCode =
    `/*@!Encoding:65001*/
/**
 * @file testCase01BlockSizeValueHandlingCANGroup.cin
 */
includes
{


}

variables
{


}

testcase testCase01BlockSizeValueHandlingCANGroup(byte session_ind, enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)
{
    byte payload[8];
    byte validation[8];
    int dataLength;
    char out[100];
    char textDeviceUnderTest[50];

    dutData.FC_WAIT_DELAY = data.FC_WAIT_DELAY;
    dutData.FC_DELAY = data.FC_DELAY;
    dutData.BS = data.BS;
    dutData.STmin = data.STmin;
    int x;
    strncpy(textDeviceUnderTest, "Device under test: ", 20);

}`;
    const expectedErrors = [
        { line: 29, error: 'Variable declaration should happen at the start of a function block. Statement: - int x;' }
    ];
    console.log(expectedErrors);
    let evaluatedErrors = await lintCode(inputCode);
    console.log(evaluatedErrors);
    expect(evaluatedErrors).toEqual(expectedErrors);
})