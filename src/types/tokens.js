// # Copyright (c) 2014-2021 Feudal Code Limitada - MIT license #

"use strict"

export function createToken(row, col, kind, value, matches) {
    const token = new Token(row, col, kind, value, matches)
    Object.seal(token)
    return token
}

export function tokenToString(token) {
    let sRow = token.row.toString()
    while (sRow.length < 4) { sRow = " " + sRow }

    let sCol = token.col.toString()
    while (sCol.length < 4) { sCol += " " }

    let sKind = token.kind
    while (sKind.length < 18) { sKind = " " + sKind }

    const sValue = token.tokenValue

    return (sRow + ":" + sCol + sKind + " " + sValue)
}

// constructor ////////////////////////////////////////////////////////////////

function Token(row, col, kind, value, matches) {
    this.row = row
    this.col = col
    this.kind  = kind
    this.tokenValue = value
    this.tokenMatch = matches
    // during declaration:
    this.isImport = false
    this.isConstant = false
    this.isInclude = false
    this.isVariable = false
    // after declaration:
    this.wasUsed = false
    this.wasAssigned = false
    this.wasExported = false
    // defined in Specs:
    this.definedInSpec = "MATCHED"
    // defined in Literals:
    this.definedInLiterals = "HANDLED"

    // contoller for parent block indentation
    this.parentBlockIndentation = 0

}

//