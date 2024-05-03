const dataTypes = ['void', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
const blockTypes = ['testcase', 'includes','variables','/*','/**', 'for', 'while', 'do', 'if', 'else'];
const standaloneKeyWords = ['includes','variables','#include','{', '}'];
const commentsKeyWords = ['/*','/**', '//', '*', '*/'];
const includesBlock = ['{', '}', 'includes', '//', '*', '*/', '#include', ''];
const variablesBlock = ['{', '}', 'variables', '//', '*', '*/', '', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
const functionBlocks = ['function','if'];
const noSemicolonNeeded = ['testcase', 'includes','variables','/*','/**', 'for', 'while', 'do', 'if', 'else', '//', '*', '*/', '#include', '','{', '}'];

module.exports = {
    dataTypes,
    blockTypes,
    standaloneKeyWords,
    includesBlock,
    variablesBlock,
    functionBlocks,
    commentsKeyWords,
    noSemicolonNeeded
}