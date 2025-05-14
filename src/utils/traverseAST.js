// utils/traverseAST.js
export function traverseAST(astNodes, callbackFunction) {
    const processNode = (node) => {
        if (!node || typeof node !== 'object') return;

        callbackFunction(node);

        // Recursively traverse child arrays if they exist
        const childKeys = ['value', 'body', 'statements', 'cases']; // add other potential keys as needed
        childKeys.forEach(key => {
            if (Array.isArray(node[key])) {
                node[key].forEach(child => processNode(child));
            }
        });
    };

    astNodes.forEach(processNode);
}