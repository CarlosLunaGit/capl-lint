export var currentBranch = ""   // always a string
export var closedBranches = [ ] // MUST BE RESET at start of new GLOBAL function
export var latestBranch = 1;


export function getCurrentBranch() {  // exports to register.js
    return currentBranch
}

export function openBranch() {  // called by eatFunctionCore and
                         // many "eat statement" functions

    currentBranch = valueForNewBranch();
    return currentBranch;
}

export function valueForNewBranch() {
    if (currentBranch == "") {

        if (closedBranches.includes(String(latestBranch))) {
            latestBranch++
        }

        return String(latestBranch) } // for parameters and non nested names
    //
    let n = 0
    while (true) {
        n += 1
        const candidate = currentBranch + "." + n
        if (closedBranches.indexOf(candidate) == -1) {
            return candidate  // never repeats old branch name!
        }
    }
}

export function closeBranch() { // called exclusively by closeBlock
    closedBranches.push(currentBranch)  // to never be repeated
    // ṕopping the last segment of currentBranch:
    const parts = currentBranch.split(".")
    parts.pop()
    currentBranch = parts.join(".")
}