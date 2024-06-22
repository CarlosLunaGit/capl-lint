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
    if (isConstant) { token.isConstant = isConstant }
    const statement = token.statement;
    register(statement, token, parser);
    parser.exports[statement] = token;
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

function register(statement, token, parser) {
    const first = parser.declareds[statement]
    if (first == undefined) { parser.declareds[statement] = token; return }
    //
    const msg = "Variable already declared at row " + first.row
    errorHandler.err(token, msg, parser)
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

export function markUsed(token) { // not really marking the token
    const name = token.tokenValue
    if (builtins.indexOf(name) != -1) { return }
    //
    const fullname = branchedName(name)
    if (rat.useds[fullname] == undefined) { rat.useds[fullname] = token } // registering only
                                                                          // the first occurrence
}

///////////////////////////////////////////////////////////////////////////////

function branchedName(name) {
    const branch = getCurrentBranch()
    if (branch == "") { return name }
    //
    return currentFunction + "." + branch + "." + name
}