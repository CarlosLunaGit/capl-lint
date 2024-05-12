## Linter Pipeline execution (modules)

1. Tokenizer
    * Group characters into { Type : Values } token objects, No Syntactic analysis.
    * Use of REGEX
    * Produces a stream of tokens per each line analyzed (Intermediate represention).
2. Parser
    * Syntactic analysis
    * Use of Backus-Naur form (BNF)
    * Recursive-descent parser
    * Produces the AST / Abstract Syntax Tree (Intermediate represention).
3. Linter (Core)