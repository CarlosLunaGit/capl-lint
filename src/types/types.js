export const dataTypes = ['void', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
export const blockTypes = ['testcase', 'includes','variables','/*','/**', 'for', 'while', 'do', 'if', 'else'];
export const standaloneKeyWords = ['includes','variables','#include','{', '}'];
export const commentsKeyWords = ['/*','/**', '//', '*', '*/'];
export const includesBlock = ['{', '}', 'includes', '//', '*', '*/', '#include', ''];
export const variablesBlock = ['{', '}', 'variables', '//', '*', '*/', '', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
export const functionBlocks = ['function','if'];
export const noSemicolonNeeded = ['testcase', 'includes','variables','/*','/**', 'for', 'while', 'do', 'if', 'else', '//', '*', '*/', '#include', '','{', '}'];
export const kinds = ['VariableDeclaration'];

//Approved
export const functionsDataTypes = ['testcase', 'void', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum'];
