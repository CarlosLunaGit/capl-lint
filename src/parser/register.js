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

function register(name, token, parser) {
    const first = parser.declareds[name]
    if (first == undefined) { parser.declareds[name] = token; return }
    //
    const msg = "Variable already declared at row " + first.row
    errorHandler.dupicatedDeclaration(token, msg, parser)
    return
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

export function markUsed(token, parser) { // not really marking the token
    const name = token.unexpected;
    if ([token.unexpected].map(key => key in parser.declareds)[0] == false) { return false }
    //
    return true;

}

///////////////////////////////////////////////////////////////////////////////

function branchedName(name) {
    const branch = getCurrentBranch()
    if (branch == "") { return name }
    //
    return currentFunction + "." + branch + "." + name
}