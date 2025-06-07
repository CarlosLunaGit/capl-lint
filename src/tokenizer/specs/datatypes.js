export const datatypes = [
    // Scalar data types
    { type: 'BYTE', regex: /^byte(?=\s)/ },
    { type: 'WORD', regex: /^word(?=\s)/ },
    { type: 'DWORD', regex: /^dword(?=\s)/ },
    { type: 'INT', regex: /^int(?=\s)/ },
    { type: 'LONG', regex: /^long(?=\s)/ },
    { type: 'INT64', regex: /^int64(?=\s)/ },
    { type: 'GWORD', regex: /^gword(?=\s)/ },
    { type: 'CHAR', regex: /^char(?=\s)/ },
    { type: 'FLOAT', regex: /^float(?=\s)/ },
    { type: 'DOUBLE', regex: /^double(?=\s)/ },

    // Self defined structures
    { type: 'STRUCT', regex: /^struct(?=\s)/ },

    // Enumeration types
    { type: 'ENUM', regex: /^enum(?=\s)/ },

    // Objects
    { type: 'A429WORD', regex: /^a429word(?=\s)/ },
    { type: 'A429SETTINGS', regex: /^a429settings(?=\s)/ },
    { type: 'A664MESSAGE', regex: /^a664Message(?=\s)/ },
    { type: 'A664FRAME', regex: /^a664Frame(?=\s)/ },
    { type: 'MESSAGE', regex: /^message(?=\s)/ },
    { type: 'MULTIPLEXEDMESSAGE', regex: /^multiplexed_message(?=\s)/ },
    { type: 'LINFRAME', regex: /^linFrame(?=\s)/ },
    { type: 'DBMSG', regex: /^dbMsg(?=\s)/ },
    { type: 'DBNODE', regex: /^dbNode(?=\s)/ },
    { type: 'DBPDU', regex: /^dbPdu(?=\s)/ },
    { type: 'DBFRFRAME', regex: /^dbFrFrame(?=\s)/ },
    { type: 'DBFRPDU', regex: /^dbFrPdu(?=\s)/ },
    { type: 'DIAGREQUEST', regex: /^diagRequest(?=\s)/ },
    { type: 'DIAGRESPONSE', regex: /^diagResponse(?=\s)/ },
    { type: 'FRFRAME', regex: /^FRFrame(?=\s)/ },
    { type: 'FRPDU', regex: /^FRPDU(?=\s)/ },
    { type: 'FRCONFIGURATION', regex: /^FRConfiguration(?=\s)/ },
    { type: 'MOSTMESSAGE', regex: /^mostMessage(?=\s)/ },
    { type: 'MOSTAMSMESSAGE', regex: /^mostAmsMessage(?=\s)/ },
    { type: 'MOSTRAWMESSAGE', regex: /^mostRawMessage(?=\s)/ },
    { type: 'SIGNAL', regex: /^Signal(?=\s)/ },
    { type: 'SERVICESIGNAL', regex: /^ServiceSignal(?=\s)/ },
    { type: 'SERVICESIGNALDATA', regex: /^ServiceSignalData(?=\s)/ },
    { type: 'SERVICESIGNALDATANUMBER', regex: /^ServiceSignalDataNumber(?=\s)/ },
    { type: 'SERVICESIGNALDATASTRING', regex: /^ServiceSignalDataString(?=\s)/ },
    { type: 'SYSVARALT1', regex: /^@[S-s]ys[V-v]ar(?=:)/ }, // Sysvar alternative sintax for types integer or float
    { type: 'SYSVAR', regex: /^SysVar(?=\s)/ },
    { type: 'SYSVARINT', regex: /^SysVarInt(?=\s)/ },
    { type: 'SYSVARLONGLONG', regex: /^SysVarLongLong(?=\s)/ },
    { type: 'SYSVARFLOAT', regex: /^SysVarFloat(?=\s)/ },
    { type: 'SYSVARSTRING', regex: /^SysVarString(?=\s)/ },
    { type: 'SYSVARINTARRAY', regex: /^SysVarIntArray(?=\s)/ },
    { type: 'SYSVARFLOATARRAY', regex: /^SysVarFloatArray(?=\s)/ },
    { type: 'SYSVARDATA', regex: /^SysVarData(?=\s)/ },
    { type: 'TIMER', regex: /^Timer(?=\s)/ },
    { type: 'MSTIMER', regex: /^MsTimer(?=\s)/ },
    { type: 'SIGNALNAME', regex: /^\$[a-zA-Z_][a-zA-Z0-9_]*(?=\s)/ },

    // Test
    { type: 'TESTCASE', regex: /^[T-t]est[C-c]ase(?=\s)/ },
    { type: 'TESTFUNCTION', regex: /^[T-t]est[F-f]unction(?=\s)/ },
];