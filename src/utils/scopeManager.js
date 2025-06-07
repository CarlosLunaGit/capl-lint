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
        let existingInCurrentScope = this.lookupInCurrentScope(name);
        let existingInGlobalScope = this.parent?.blockType === 'global' ? this.parent.lookupInCurrentScope(name) : false;

        if (existingInCurrentScope) {

            existingInCurrentScope.wasDeclared = true;
            return existingInCurrentScope;

        } else if (existingInGlobalScope) {

            existingInGlobalScope.wasDeclared = true;
            return existingInGlobalScope;

        }

        metadata.wasDeclared = true;
        metadata.wasUsed = metadata.wasUsed || false;

        metadata.usedIn = metadata.usedIn ? metadata.usedIn.map(s => s.blockType) : [];
        metadata.calledIn = metadata.usedIn.blockType;

        if (this.blockType === "VariablesBlock") {
            metadata.declaredIn = this; // VariablesBlock scope
            this.parent.variables.set(name, metadata);
        }else{
            metadata.declaredIn = this;
            this.variables.set(name, metadata);
        }

        return metadata;
    }

    declareUse(name, metadata = {}) {
        let existing = this.lookup(name); // changed from lookupInCurrentScope

        if (existing) {
            existing.wasUsed = true;
            if (!existing.usedIn) existing.usedIn = [];
            existing.usedIn.push(this);
            return existing;
        }

        metadata.wasDeclared = metadata.wasDeclared || false;
        metadata.wasUsed = metadata.wasUsed || false;
        metadata.declaredIn = this.currentScope;

        this.variables.set(name, metadata);
        return metadata;
    }


    // use(name, token) { // This method is used only on Unit Tests
    //     let scope = this;
    //     while (scope) {
    //         if (scope.variables.has(name)) {
    //             const meta = scope.variables.get(name);
    //             meta.wasUsed = true;

    //             if (!meta.usedIn) {
    //                 meta.usedIn = [];
    //                 meta.calledIn = [];
    //             }
    //             meta.usedIn.push(this); // track scope where it's used
    //             meta.calledIn.push(token); // track caller statement where it's used
    //             return meta;
    //         }
    //         scope = scope.parent;
    //     }
    //     return null; // Not found
    // }

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

    lookupInParentScope(name) {
        if (this.parent) {
            return this.parent.lookupInCurrentScope(name);
        }
        return null;
    }

    lookupInGlobalScope(name) {
        return this.globalScope.variables.get(name) || null;
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

    // use(name) {
    //     return this.currentScope.use(name);
    // }

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
        // Handle in-build keywords
        if ((inBuildKeywords.find((x) => x === name) !== undefined)) {
            // Always update the globalScope variable, don't redeclare if it exists
            let meta = this.globalScope.variables.get(name);
            if (!meta) {
                meta = token;
                meta.wasDeclared = true;
                meta.wasUsed = true;
                meta.declaredIn = this.globalScope;
                meta.usedIn = [this.currentScope];
                this.globalScope.variables.set(name, meta);
            } else {
                meta.wasUsed = true;
                if (!meta.usedIn) meta.usedIn = [];
                meta.usedIn.push(this.currentScope);
            }
            return;
        }

        // Support for dotted names
        let lookupName = name.indexOf('.') !== -1 ? name.split('.')[0] : name;

        // Find the scope where the variable is declared
        let scope = this.currentScope;
        let meta = null;
        while (scope) {
            if (scope.variables.has(lookupName)) {
                meta = scope.variables.get(lookupName);
                break;
            }
            scope = scope.parent;
        }

        if (meta) {
            // Update the original metadata object
            meta.wasUsed = true;
            if (!meta.usedIn) meta.usedIn = [];
            if (!meta.calledIn) meta.calledIn = [];
            meta.usedIn.push(this.currentScope);
            meta.calledIn.push(token);

            // Also update the token for reporting
            token.partialDeclaration = true;
            token.wasDeclared = meta.wasDeclared || false;
            token.wasUsed = meta.wasUsed || false;
            token.declaredIn = meta.declaredIn || null;
        } else {
            // Not declared anywhere, so declare as used in current scope
            token.wasDeclared = false;
            token.wasUsed = true;
            token.partialDeclaration = false;
            if (!token.usedIn) token.usedIn = [];
            if (!token.calledIn) token.calledIn = [];
            token.usedIn.push(this.currentScope);
            token.calledIn.push(token);

            this.currentScope.declareUse(name, token);
        }
    }

    getUndeclaredVariables() {
        return this.getAllVariables().filter(v => !v.wasDeclared);
    }

    //Create a method to log all variables in the current scope, the logs should be in JSON format and the main goal is to be able to see the variables in the current scope and their metadata, variables with the same scope should be grouped together
    logAllScopesVariables() {
        function collectScopes(scope) {
            const variables = Array.from(scope.variables.entries()).map(([name, meta]) => ({
                name,
                value: meta.value || null,
                wasDeclared: meta.wasDeclared,
                wasUsed: meta.wasUsed,
                declaredIn: meta.declaredIn ? meta.declaredIn.blockType : null,
                usedIn: meta.usedIn ? meta.usedIn.map(s => s.blockType) : [],
                type: meta.type || null

            }));
            const result = [{
                scope: scope.blockType,
                variables
            }];
            for (const child of scope.children) {
                result.push(...collectScopes(child));
            }
            return result;
        }
        const allScopes = collectScopes(this.globalScope);
        console.log(JSON.stringify(allScopes, null, 2));
    }

}

export { ScopeManager };
