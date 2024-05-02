const dataTypes = ['byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
const blockTypes = ['includes','variables','/*','/**'];
const includesBlock = ['{', '}', 'includes', '//', '*', '*/', '#include', ''];
const variablesBlock = ['{', '}', 'variables', '//', '*', '*/', '', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum',
'const byte', 'const word', 'const dword', 'const int', 'const long', 'const int64', 'const gword','const char','const float','const double','const struct','const enum'];
const functionBlocks = ['function'];

module.exports = {
    dataTypes,
    blockTypes,
    includesBlock,
    variablesBlock,
    functionBlocks
}