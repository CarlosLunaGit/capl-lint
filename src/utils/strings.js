/**
 * Removes inline comments from a CAPL line of code.
 * @param {string} line - The CAPL line of code possibly containing inline comments.
 * @returns {string} The CAPL line of code without inline comments.
 * @example
 * const line = 'doubled[i + 2] = data[i]; // Duplicate the DID';
 * const lineWithoutComments = removeInlineComments(line);
 * console.log(lineWithoutComments); // Output: "doubled[i + 2] = data[i];"
 */
export function removeInlineComments(line) {
    // Regular expression to match inline comments in CAPL (// and /* */)
    const commentRegex = /\/\/.*$|\/\*[\s\S]*?\*\//g;

    // Remove inline comments from the line
    return line.replace(commentRegex, '').trim();
}
