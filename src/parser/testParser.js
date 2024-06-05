import { Parser } from './parser.js';

const parser = new Parser();

const program = `

    /**
     * Documentation comment
     */
     22
    "hello"
    // Number:
    42
    'Carlos'

    /*@!Encoding:1252*/
        includes
        {
            /**
             * Documentation comment
             */
             11

            "helloo"
            // Number:
            33

            'Carloss'
            #include "..\\..\\dir\\dir\\file.cin"
        }

        variables
            {
                // Variable Definition
                const int EXAMPLE_CONSTANT = 10;
                var float exampleVariable = 3.14;

                var float exampleVariable = 3.14;



                /**
                 * Documentation comment
                 */
                 22
                "hello"
                // Number:
                42
                'Carlos'

            }

        void MainTest ()
            {
            int ret,i;
            int nr_of_ecus=0;
            long returnval;

            Init(nr_of_ecus, 1);
            write("nr_of_ecus is %d",nr_of_ecus)
            }

    `;

    // byte byteVariable = {0x01};
    // byte byteVariableError = {0x02}
const parserHandler = parser.parse(program);

console.log(JSON.stringify(parserHandler.tokens, null, 2));

console.log(parserHandler.tokenizer.branchController.closedBranches);

parserHandler.mainLoop();

console.log(parserHandler.errors);
console.log(parserHandler.sysErrors);
