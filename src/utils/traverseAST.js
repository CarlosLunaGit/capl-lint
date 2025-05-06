// utils/traverseAST.js
export function traverseAST(astNodes, visitorFn) {
    const visit = (node) => {
        if (!node || typeof node !== 'object') return;

        visitorFn(node);

        // Recursively traverse child arrays if they exist
        const childKeys = ['value', 'body', 'statements', 'cases']; // add other potential keys as needed
        childKeys.forEach(key => {
            if (Array.isArray(node[key])) {
                node[key].forEach(child => visit(child));
            }
        });
    };

    astNodes.forEach(visit);
}