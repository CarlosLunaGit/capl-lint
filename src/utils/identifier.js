import { blocksSpec } from "../tokenizer/specs";

export async function identifyCAPLStatementTypes(line) {
    // Regular expressions for identifying different CAPL statement types

    for (let i = 0; i < blocksSpec.length; i++) {
        const [kind, regex, type] = blocksSpec[i];
        const match = line.match(regex);

        if (match) {
            switch (type) {
                case 'Comment':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'MessageDefinitionBlock':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'VariableDeclaration':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'VariableDeclarationSecondsTimer':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'ClosingBlock':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'Whitespace':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'MessageEventBlock':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'FunctionCall':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'ifCall':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'elseCall':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'StartEventBlock':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'forLoop':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];
                case 'TimerEventBlock':
                    return [{
                        type: type,
                        tokenizerKind: kind,
                        original: match[0],
                        ...match.groups
                    }];

                default:
                    console.log(`Statement type not handled in identifyCAPLStatementTypes ${match[0]}`);
                    break;
            }

        }

    }
    // If none of the above match, it's likely a UNMATCHED statement in SPECS
    return [{
        type: "UNMATCHED Statement not in SPECS",
        original: line,
    }];

    // const messageDefinitionRegex = /^(?:(message)\s*(\w+)\s*(\{)*)/;
    // const variableDefinitionRegex = /^(var|const)? ?(void|int|long|float|double|char|byte|word|dword|int64|gword) +(\w+) ?(\[.*\])? *(=)? *([^;]+)?(;)?/;
    // const caplFunctionDefinitionRegex = /^(on ?(?:message|start|timer|key|sysvar|envvar|measure|signal)) *(\w+) *(\{)?/;
    // const controlStructureRegex = /^(if|else|while|for|switch)\s*\(([^)]+)\)\s*\{(.*)\}/;
    // const functionCallRegex = /^(\w+)\s*\(([^)]*)\);/;
    // const eventHandlerRegex = /^(on\s+(?:message|key|timer|start))\s+(\w+)\s*\{(.*)\}/;
    // const loopIterationRegex = /^(while|for)\s*\(([^)]+)\)\s*\{(.*)\}/;
    // const timerEventRegex = /^on\s+timer\s+(\w+)\s*\{(.*)\}/;
    // const messageReceptionRegex = /^on\s+message\s+(\w+)\s*\{(.*)\}/;
    // const signalManipulationRegex = /^(setSignal|onSignal)\s+\w+\s*\(.+\);/;
    // const envVarHandlingRegex = /^(getEnvVar|setEnvVar)\s+\w+\s*\(.+\);/;
    // const singleClosingBracket = /(^\}$)/;

    // // Check for message definition
    // let match = line.match(messageDefinitionRegex);
    // if (match) {
    //     return [{
    //         type: "messageDefinition",
    //         original: match[0],
    //         keyword: match[1],
    //         name: match[2],
    //         openingBracket: match[3]
    //     }];
    // }

    // // Check for variable definition
    // match = line.match(variableDefinitionRegex);
    // if (match) {
    //     return [{
    //         type: "variableDeclaration",
    //         original: match[0],
    //         modifier: match[1],
    //         dataType: match[2],
    //         name: match[3],
    //         arraySize: match[4],
    //         assignment: match[5],
    //         value: match[6],
    //         semicolon: match[7]
    //     }];
    // }

    // // Check for function definition
    // match = line.match(caplFunctionDefinitionRegex);
    // if (match) {
    //     return [{
    //         type: "caplFunctionDefinition",
    //         original: match[0],
    //         event: match[1],
    //         name: match[2],
    //         openingBracket: match[3]
    //     }];
    // }

    // // Check for control structure
    // match = line.match(controlStructureRegex);
    // if (match) {
    //     return [{
    //         type: "Control Structure",
    //         original: match[0],
    //         keyword: match[1],
    //         condition: match[2],
    //         content: match[3]
    //     }];
    // }

    // // Check for function call
    // match = line.match(functionCallRegex);
    // if (match) {
    //     return [{
    //         type: "Function Call",
    //         original: match[0],
    //         name: match[1],
    //         arguments: match[2]
    //     }];
    // }

    // // Check for event handler
    // match = line.match(eventHandlerRegex);
    // if (match) {
    //     return [{
    //         type: "Event Handler",
    //         original: match[0],
    //         event: match[1],
    //         name: match[2],
    //         content: match[3]
    //     }];
    // }

    // // Check for loop iteration
    // match = line.match(loopIterationRegex);
    // if (match) {
    //     return [{
    //         type: "Loop Iteration",
    //         original: match[0],
    //         keyword: match[1],
    //         condition: match[2],
    //         content: match[3]
    //     }];
    // }

    // // Check for timer event
    // match = line.match(timerEventRegex);
    // if (match) {
    //     return [{
    //         type: "Timer Event",
    //         original: match[0],
    //         name: match[1],
    //         content: match[2]
    //     }];
    // }

    // // Check for message reception
    // match = line.match(messageReceptionRegex);
    // if (match) {
    //     return [{
    //         type: "Message Reception",
    //         original: match[0],
    //         name: match[1],
    //         content: match[2]
    //     }];
    // }

    // // Check for signal manipulation
    // if (signalManipulationRegex.test(line)) {
    //     return [{
    //         type: "Signal Manipulation",
    //         original: match[0],
    //     }];
    // }

    // // Check for environment variable handling
    // if (envVarHandlingRegex.test(line)) {
    //     return [{
    //         type: "Environment Variable Handling",
    //         original: match[0]
    //     }];
    // }

    // // Check for single closing bracket handling
    // match = line.match(singleClosingBracket);
    // if (match) {
    //     return [{
    //         type: "singleClosingBracket",
    //         original: match[0]
    //     }];
    // }

    // // If none of the above match, it's likely a statement
    // return [{
    //     type: "Statement not identified",
    //     original: line,
    // }];
}
