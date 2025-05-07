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
      if (this.variables.has(name)) {
        throw new Error(`Variable '${name}' is already declared in this scope.`);
      }
      this.variables.set(name, { ...metadata, wasDeclared: true, wasUsed: false });
      return this.variables.get(name);
    }

    use(name) {
      // Look for the variable in the current scope or recursively in the parent
      if (this.variables.has(name)) {
        const variable = this.variables.get(name);
        variable.wasUsed = true;
        return variable;
      } else if (this.parent) {
        return this.parent.use(name);
      } else {
        // Optionally track undeclared usage at the root level
        return null;
      }
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

  }

  export { ScopeManager };
