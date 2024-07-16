import { parse } from '@babel/core';
import * as errorHandler from './errors.js';
// imports ////////////////////////////////////////////////////////////////////

export function registerImport(pathToken, nameTokens) {
    // some code here
}

// Includes BLOCKS ////////////////////////////////////////////////////////////

export function registerIncludesBlock(token, parser) {

    if ( (token.kind === 'IncludeStatement') || (token.kind === 'IncludesBlock') ) { token.inContext = true }

    const statement = token.statement;
    registerIncludes(statement, token, parser);
    // parser.exports[statement] = token;

}

// global variables ///////////////////////////////////////////////////////////

export function registerPublicVariable(token, isConstant, parser) {
    let name;
    if (isConstant) { token.isConstant = isConstant }

    if (token.isVariable == false) {
        name = 'local.' + token.name + '.' + token.path;
    } else {
        name = 'global.' + token.name + '.' + token.path;
    }

    register(name, token, parser);
    parser.exports[name] = token;
}


export function checkRegisterPublicVariable(token, parser) {

    const registered = markUsed(token, parser);

    if (registered == true) {
        errorHandler.err(token, "Variable declared but not a valid statement, Parse Error", parser)
    }else{
        errorHandler.err(token, "Variable not declared or unexpected statement, Parse Error", parser)
    }

}

export function registerPrivateVariable(token, isConstant) {
    if (isConstant) { token.isConstant = isConstant }
    const name = token.tokenValue
    register(name, token)
}

// functions //////////////////////////////////////////////////////////////////

export function registerPublicFunction(token) {
    const name = token.tokenValue
    register(name, token)
    currentFunction = name
    rat.exports[name] = token
}

export function registerPrivateFunction(token) {
    const name = token.tokenValue
    register(name, token)
    currentFunction = name
}

export function registerInnerFunction(token) {
    const fullname = branchedName(token.tokenValue)
    register(fullname, token)
}

export function registerAnonymousFunction() {
    // pass
}

// parameters and local variables /////////////////////////////////////////////

export function registerParameter(token) {
    const fullname = branchedName(token.tokenValue)
    register(fullname, token)
}

export function registerLocalVariable(token, isConstant) {
    if (isConstant) { token.isConstant = isConstant }
    const fullname = branchedName(token.tokenValue)
    register(fullname, token)
}

/////////////////////////////////////////////////////////////////////////////

export function endGlobalFunction() { // good for main and init
    currentFunction = ""
}

///////////////////////////////////////////////////////////////////////////////

// IMPORTANT CORE FUNCTION FOR ALL KINDS OF DECLARATION

// function register(name, token, parser) {
//     const first = parser.declareds[name]

//     if (first == undefined) { parser.declareds[name] = token; return }
//     //
//     const msg = "Variable already declared at row " + first.row
//     errorHandler.duplicatedDeclaration(token, msg, parser)
//     return
// }

function register(name, token, parser) {
    const [context, variableName, variablePath] = name.split('.');
    // const variableName = variablePath.split('.').slice(0, -1).join('.');

    const declareds = parser.declareds;

    const isGlobal = context === 'global';
    const isLocal = context === 'local';

    if (isGlobal) {
        const globalKey = `global.${variableName}`;
        if (declareds[globalKey] == undefined) {
            declareds[globalKey] = token;
            return;
        } else {
            const msg = `Global variable already declared at row ${declareds[globalKey].row}`;
            errorHandler.duplicatedDeclaration(token, msg, parser);
            return;
        }
    }

    if (isLocal) {
        // Extract the scope level
        const scopePath = variablePath.split('.');
        const currentScope = scopePath.slice(0, scopePath.length - 1).join('.');

        for (const key in declareds) {
            if (key.startsWith('local.') && key.split('.')[1] === variableName) {
                const declaredScopePath = key.split('.').slice(1); // Remove the 'local' prefix
                const declaredScope = declaredScopePath.slice(0, declaredScopePath.length - 1).join('.');

                if (declaredScope === currentScope) {
                    const msg = `Variable already declared in the same scope at row ${declareds[key].row}`;
                    errorHandler.duplicatedDeclaration(token, msg, parser);
                    return;
                } else if (currentScope.startsWith(declaredScope) || declaredScope.startsWith(currentScope)) {
                    const msg = `Variable already declared in a nested scope at row ${declareds[key].row}`;
                    errorHandler.duplicatedDeclaration(token, msg, parser);
                    return;
                }
            }
            if (key.startsWith('global.') && key.split('.')[1] === variableName) {
                const globalKey = `global.${variableName}`;
                const msg = `Variable value initialized at row ${declareds[globalKey].row} will be overwritten by the new value at row ${token.row}. Statement: - ${token.statement}`;
                errorHandler.overwritenDeclaration(token, msg, parser);
                return;
            }
        }

        // If no conflicts were found, register the variable
        declareds[name] = token;
    }
}


function registerIncludes(statement, token, parser) {
    const first = parser.includes[statement]
    if (first == undefined) { parser.includes[statement] = token; return }
    //
    const msg = "Include already declared at row " + first.row
    errorHandler.err(token, msg, parser)
    return
}

///////////////////////////////////////////////////////////////////////////////

// export function markUsed(token, parser) { // not really marking the token
//     const name = token.unexpected;
//     if ([token.unexpected].map(key => key in parser.declareds)[0] == false) { return false }
//     //
//     return true;

// }

export function markUsed(token, parser) {
    const name = token.unexpected;
    // const [context, variableName, variablePath] = name.split('.');
    // const variableName = variablePath.split('.').slice(0, -1).join('.');

    const declareds = parser.declareds;

    for (const key in declareds) {
        if (key.startsWith(`global.${name}`)) {
            return true;
        }
        if (key.startsWith(`local.${name}`)) {
            return true;
        }
    }

    return false;
}


///////////////////////////////////////////////////////////////////////////////

function branchedName(name) {
    const branch = getCurrentBranch()
    if (branch == "") { return name }
    //
    return currentFunction + "." + branch + "." + name
}