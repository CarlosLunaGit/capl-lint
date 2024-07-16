export function expecting(token, msg, parser) {
    msg = makeUnexpectedMessage(token) + " (expecting " + msg +")"
    error(token.row, token.col, msg, parser)
}

export function invalidStatement(token, msg, parser) {
    msg = makeUnexpectedMessage(token) + " (Invalid Line will cause parsing error)"
    error(token.row, token.col, msg, parser)
}

export function unexpected(token, msg = '', parser) {
    if (msg != '') {
        msg = makeUnexpectedMessage(token) + " (unexpected \"" + msg +"\")"

    } else {
        msg = makeUnexpectedMessage(token)

    }
    error(token.row, token.col, msg, parser)
}

export function _unexpected(token, parser) {

    parser.sysErrors.push(token);
}

export function unexpectedScope(token, parser) {
    const msg = makeUnexpectedScopeMessage(token)
    error(token.row, token.col, msg, parser)
}

export function err(token, msg, parser) {
    error(token.row, token.col, msg, parser)
}

export function duplicatedDeclaration(token, msg, parser) {
    error(token.row, token.col, msg, parser)
}

export function overwritenDeclaration(token, msg, parser) {
    warning(token.row, token.col, msg, parser)
}

// complete error function ////////////////////////////////////////////////////

export function error(row, col, msg, parser) {
    let message;
    console.log("\n" + "   (" + row + ":" + col +")")
    message = "ERROR: " + msg;
    console.log(message)
    parser.errors.push({
        line: row,
        col: col,
        error: message,
        type: 'Error',
        priority: 1});

}

export function warning(row, col, msg, parser) {
    let message;
    console.log("\n" + "   (" + row + ":" + col +")")
    message = "WARNING: " + msg;
    console.log(message)
    parser.errors.push({
        line: row,
        col: col,
        error: message,
        type: 'Warning',
        priority: 2});
}

// private helper functions ///////////////////////////////////////////////////

function makeUnexpectedMessage(token) {
    let msg = `On statement "${token.statement || token.tokenValue}"`
    if (token.kind == "end-of-line") { msg = "unexpected end of line" }
    if (token.kind == "end-of-file") { msg = "unexpected end of file" }
    return msg
}

function makeUnexpectedScopeMessage(token) {
    let msg = `Unexpected token out of any block scope (Includes, Variables or Function scope ) ${token.statement || token.tokenValue}`
    if (token.kind == "end-of-line") { msg = "unexpected end of line" }
    if (token.kind == "end-of-file") { msg = "unexpected end of file" }
    return msg
}
