const dataTypes = ['byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum'];
const blockTypes = ['includes','variables','void','/**', 'testcase'];
const includesBlock = ['{', '}', 'includes', '//', '*', '*/', '#include', ''];
const variablesBlock = ['{', '}', 'variables', '//', '*', '*/', '', 'byte', 'word', 'dword', 'int', 'long', 'int64', 'gword','char','float','double','struct','enum']

module.exports = {
    dataTypes,
    blockTypes,
    includesBlock,
    variablesBlock
}