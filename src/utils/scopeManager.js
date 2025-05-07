import {inBuildKeywords} from '../tokenizer/specs/inbuildCAPLKeywords.js'

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
        this.variables.set(name, metadata);
        return metadata;
    }


    use(name) {
        let scope = this;
        while (scope) {
          if (scope.variables.has(name)) {
            const meta = scope.variables.get(name);
            meta.wasUsed = true;
            if (!meta.usedIn) meta.usedIn = [];
            meta.usedIn.push(this); // track scope where it's used
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
            this.currentScope.declare(name, {
                wasDeclared : true,
                wasUsed : false,
                declaredIn : this.globalScope

            })
        }

        let meta = this.currentScope.lookup(name); // search all scopes

        if (meta) {
            meta.wasUsed = true;
            if (!meta.usedIn) meta.usedIn = [];
            meta.usedIn.push(this.currentScope);
        } else {
            // Variable not declared anywhere — add it to global scope for tracking
            meta = {
                wasDeclared: false,
                wasUsed: true,
                usedIn: [this.currentScope],
                token
            };
            this.currentScope.variables.set(name, meta); // <-- single source of truth
        }
    }



    getUndeclaredVariables() {
        return this.getAllVariables().filter(v => !v.wasDeclared);
    }


  }

  export { ScopeManager };
