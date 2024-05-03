const { lintCode } = require('../../src/core/lintCode');

describe('Critical Rules Suite', () => {

    test('lintCode detects not allowed statements within INCLUDES Block', async () => {

        const inputCode =
        `includes
        {
            // Comment
            #include "..\\TestLibraries\\responses.cin"
            #include "..\\TestLibraries\\utils.cin"
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x01,0x02,0x03};
        }`;

        const expectedErrors = [
            {
                line: 6,
                error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte variable1[3]={0x01,0x02,0x03};',
                priority: 1,
                type: "Critical Rule"
            },
            {
                line: 7,
                error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte variable2[3]={0x01,0x02,0x03};',
                priority: 1,
                type: "Critical Rule"
            }
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
            byte variable1[3]={0x01,0x02,0x03};
            // Comment
            byte variable2[3]={0x04,0x05,0x06};
            int x = 10;
            int y = 20;
            #include "..\\myLibraries\\utils.cin"
        }`;
        const expectedErrors = [
            {
                line: 8,
                error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\myLibraries\\utils.cin"',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lintCode detects not allowed statements within VARIABLES Block (const prefix case)', async () => {
        const inputCode =
        `/*@!Encoding:65001*/
        includes
        {

        }

        variables
        {

            const int totalECUs=105;
            char ECUName[5];
            byte fcDIDCAN[3];
            byte fcDIDCANFD1st[3];
            byte fcDIDCANFD2nd[3];
            #include "..\\TestLibraries\\utils.cin"

        }`;
        const expectedErrors = [
            {
                line: 15,
                error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\TestLibraries\\utils.cin"',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lintCode detects missing semicolons for LINE STATEMENTS', async () => {
        const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x04,0x05,0x06};
            int x = 10;
            int y = 20;
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
                write("%d",w)
            }
	    }`;
        const expectedErrors = [
            {
                line: 17,
                error: 'Line statement should end with a semicolon. Statement: - write("%d",w)',
                priority: 1,
                type: "Critical Rule" }
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
        variables {
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x04,0x05,0x06}
            int x = 10;
            int y = 20
        }`;
        const expectedErrors = [
            {
                line: 7,
                error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte variable2[3]={0x04,0x05,0x06}',
                priority: 1,
                type: "Critical Rule" },
            {
                line: 9,
                error: 'Variable declaration should end with a semicolon. Statement: - int y = 20',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lintCode detects missing semicolons for Variables declaration (Multi-line case)', async () => {
        const inputCode =
        `variables
        {
            byte EDA0_RESPONSE[3]={0x62,0xED,0xA0};
            byte EE01_RESPONSE[3]={0x62,0xEE,0x01}
            int x = 10;
            int y = 20

            struct fcDIDLookupTableStr {
                char ECUName[5];
                byte fcDIDCAN[3];
                byte fcDIDCANFD1st[3];
                byte fcDIDCANFD2nd[3];
            } fcDIDLookupTable[200]
        }`;
        const expectedErrors = [
            {
                line: 4,
                error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte EE01_RESPONSE[3]={0x62,0xEE,0x01}',
                priority: 1,
                type: "Critical Rule" },
            {
                line: 6,
                error: 'Variable declaration should end with a semicolon. Statement: - int y = 20',
                priority: 1,
                type: "Critical Rule" },
            {
                line: 13,
                error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - } fcDIDLookupTable[200]',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

    test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION.', async () => {
        const inputCode =
        `/*@!Encoding:1252*/
        includes
        {

        }

        variables {


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
            {
                line: 21,
                error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int w = 10;',
                priority: 1,
                type: "Critical Rule" }
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

    testcase myTestCase(byte data, enum ENUMERATION mode)
    {
        byte data1[8];
        byte data2[8];
        int dataLength;
        char text1[100];
        char text2[50];

        dutData.D1 = data1;
        dutData.D2 = data2;
        dutData.DL = dataLength;

        int x;
        strncpy(text1, text2, elcount(text1));

    }`;
        const expectedErrors = [
            {
                line: 29,
                error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int x;',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lindCode detects declaration of local variables not at the beginning portion of the FUNCTION (Ignoring empty rows).', async () => {
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
            {
                line: 23,
                error: 'Variable declarations must be the first lines within curly brackets of a block. Statement: - int w = 10;',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lindCode detects missing comma to separate parameters in TESTCASE.', async () => {
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

    testcase testCase01BlockSizeValueHandlingCANGroup(byte session_ind enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)
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
        strncpy(textDeviceUnderTest, "Device under test: ", 20);

    }`;
        const expectedErrors = [
            {
                line: 17,
                error: 'Missing comma to separate parameters in function declaration. Statement: - testCase01BlockSizeValueHandlingCANGroup(byte session_ind enum ADDRESSING_MODE mode, enum BT_BusTypes busType, struct TEST_CASE_DATA data, int index)',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

    test('lindCode detects wrong FUNCTION declaration (function type array).', async () => {
        const inputCode =
        `/*@!Encoding:1252*/
        includes
        {

        }

        variables
        {


        }

        byte[] myFunctionOfTypeArray()
        {

            int x = 10;
            int y = 20;
            int z;
            z = x + y;
            // some comments
            if (1){
            write("%d",z);
                write("%d",w);
            }
            return [];
        }`;
        const expectedErrors = [
            {
                line: 13,
                error: 'Function declaration CANNOT be of type ARRAY, use Referenced variables to return array types. Statement: - byte[] myFunctionOfTypeArray()',
                priority: 1,
                type: "Critical Rule" }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    })

  })

  describe('Format Rules Suite', () => {

    test('lintCode suggest opening CURLY BRACKET must be on the same line', async () => {
    const inputCode =
        `variables
        {
            byte variable1[3]={0x01,0x02,0x03};
            byte variable2[3]={0x04,0x05,0x06};
            int x = 10;
            int y = 20;
        }`;
        const expectedErrors = [
            {
                line: 1,
                error: 'Opening curly bracket must be on the same line as the keyword for control structures. Statement: - variables',
                priority: 2,
                type: "Format Rules (Clang)"
            }
        ];
        console.log(expectedErrors);
        let evaluatedErrors = await lintCode(inputCode);
        console.log(evaluatedErrors);
        expect(evaluatedErrors).toEqual(expectedErrors);
    });

  })

