import { inBuildKeywords } from '../tokenizer/specs/inbuildCAPLKeywords.js'

class Scope {
    constructor(parent = null, blockType = 'global') {
        this.parent = parent;
        this.blockType = blockType;
        this.variables = new Map();
        this.children = [];
    }

    addChild(scope) {
        this.children.push(scope);
    }

    declare(name, metadata = {}) {
        let existing = this.lookupInCurrentScope(name);
        if (existing) {
            existing.wasDeclared = true;
            return existing;
        }

        metadata.wasDeclared = true;
        metadata.wasUsed = metadata.wasUsed || false;
        metadata.declaredIn = this.currentScope;
        metadata.partialDeclaration = false;
        metadata.usedIn = [];
        metadata.calledIn = [];
        this.variables.set(name, metadata);
        return metadata;
    }

    declareUse(name, metadata = {}) {
        let existing = this.lookupInCurrentScope(name);
        if (existing) {
            existing.wasUsed = true;
            return existing;
        }

        metadata.wasDeclared = false;
        metadata.wasUsed = metadata.wasUsed || false;
        metadata.declaredIn = this.currentScope;
        metadata.partialDeclaration = false;
        this.variables.set(name, metadata);
        return metadata;
    }


    use(name, token) {
        let scope = this;
        while (scope) {
            if (scope.variables.has(name)) {
                const meta = scope.variables.get(name);
                meta.wasUsed = true;

                if (!meta.usedIn) {
                    meta.usedIn = [];
                    meta.calledIn = [];
                }
                meta.usedIn.push(this); // track scope where it's used
                meta.calledIn.push(token); // track caller statement where it's used
                return meta;
            }
            scope = scope.parent;
        }
        return null; // Not found
    }

    getDeclaredVariables() {
        return Array.from(this.variables.entries());
    }

    getAllVariablesRecursive() {
        let all = this.getDeclaredVariables();
        for (const child of this.children) {
            all = all.concat(child.getAllVariablesRecursive());
        }
        return all;
    }

    lookupInCurrentScope(name) {
        return this.variables.get(name) || null;
    }

    lookup(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name);
        } else if (this.parent) {
            return this.parent.lookup(name);
        } else {
            return null;
        }
    }

}

class ScopeManager {
    constructor() {
        this.globalScope = new Scope(null, 'global');
        this.currentScope = this.globalScope;
    }

    enterScope(blockType = 'block') {
        const newScope = new Scope(this.currentScope, blockType);
        this.currentScope.addChild(newScope);
        this.currentScope = newScope;
    }

    exitScope() {
        if (!this.currentScope.parent) throw new Error("Cannot exit global scope");
        const completedScope = this.currentScope;
        this.currentScope = this.currentScope.parent;
        return completedScope;
    }

    declare(name, metadata = {}) {
        return this.currentScope.declare(name, metadata);
    }

    use(name) {
        return this.currentScope.use(name);
    }

    getGlobalScope() {
        return this.globalScope;
    }

    getAllVariables() {
        return this.globalScope.getAllVariablesRecursive().map(([name, meta]) => ({
            name,
            ...meta
        }));
    }

    getVariable(name) {
        return this.currentScope.lookup(name);
    }

    trackVariableUsage(name, token) {

        if ((inBuildKeywords.find((x) => x === name) !== undefined) && (this.currentScope.lookup(name) === null)) {

            token.wasDeclared = true;
            token.wasUsed = true;
            token.declaredIn = this.globalScope;

            this.currentScope.declare(name, token)
        }

        let partialDeclaration = false;
        let lookupName = '';

        if (name.indexOf('.') !== -1) {
            lookupName = name.split('.')[0];
            partialDeclaration = true;
        } else {
            lookupName = name;
        }

        let meta = this.currentScope.lookup(lookupName); // search all scopes

        if (meta) {
            meta.wasUsed = true;
            if (!meta.usedIn) {
                meta.usedIn = [];
                meta.calledIn = [];
                meta.partialDeclaration = partialDeclaration;
            }
            meta.usedIn.push(this.currentScope);
            meta.calledIn.push(token); // track caller statement where it's used

        } else {

            token.wasDeclared = false;
            token.wasUsed = true;
            // token.usedIn = this.globalScope;
            token.usedIn.push(this.currentScope);
            token.calledIn.push(token); // track caller statement where it's used
            token.partialDeclaration = false;

            this.currentScope.declareUse(name, token)
        }
    }



    getUndeclaredVariables() {
        return this.getAllVariables().filter(v => !v.wasDeclared);
    }


}

export { ScopeManager };
