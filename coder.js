const fs = require('fs')
const blake = require('blakejs')
const FATE = require('./FATE_data.js')
var base64check = require('base64check')

const HASH_BYTES = 32



const aci = JSON.parse(fs.readFileSync('build/identity.json', 'utf-8'))
const contractAci = aci[0].contract
// console.log(aci)
// console.log(contractAci)

function createCalldata(funName, args) {
    const funcAci = contractAci.functions.find(e => e.name == funName)
    const argAci = (funcAci) ? funcAci.arguments : []
    // console.log(argAci)

    let serializedArgs = []
    for (let i = 0; i < argAci.length; i++) {
        const value = args[i]
        const type = argAci[i].type
        const serArg = serialize(type, value)
        serializedArgs.push(serArg)
        // console.log("Serialize arg:", i, value, type, serArg, 
        //     serArg.map(a => a.toString(2).padStart(8, '0')))

    }

    // console.log(serializedArgs)
    // if (serializedArgs.length === 0) {
    //     const argsTuple = (serializedArgs.length === 0) ? serializeTuple([]) : serializeTuple(serializedArgs)
    // }

    const functionId = symbolIdentifier(funName)
    // console.log("Function ID:", functionId, serializeByteArray(functionId))

    const argsTuple = serializeTuple(serializedArgs)
    // console.log("args typle:", argsTuple)
    // console.log(Array.from(functionId).concat(argsTuple))

    const funcTuple = serializeTuple([
            serializeByteArray(functionId),
            argsTuple
    ])

    // console.log("function tuple", funcTuple)

    return new Uint8Array(funcTuple.flat(Infinity))
    // const calldata = serializeTuple(funcTuple)

    // return calldata
}

function symbolIdentifier(funName) {
    // First 4 bytes of 32 bytes blake hash
    hash = Array.from(blake.blake2b(funName, null, 32))
    // console.log("Blake2b 32 bytes hash", hash)

    return hash.slice(0, 4)
}

function serializeTuple(tuple) {
    if (tuple.length === 0) {
        // console.log(
        //     "serialized empty typle:",
        //     [FATE.EMPTY_TUPLE]
        // )
        return [FATE.EMPTY_TUPLE]
    }

    // should we serialize it ?! what about types ?!
    // const elements = tuple.map(e => serialize(x))
    const elements = tuple

    if (tuple.length < 16) {
        const lenBin = (tuple.length << 4)
        const prefix = (tuple.length << 4) | FATE.SHORT_TUPLE
        // console.log(
        //     "serialized tuple (len, lenbin, shlbin, prefix, prefixbin):",
        //     tuple.length,
        //     tuple.length.toString(2).padStart(8, '0'),
        //     lenBin.toString(2).padStart(8, '0'),
        //     prefix,
        //     prefix.toString(2).padStart(8, '0')
        // )
        return [
            prefix,
            ...elements
        ]
    }

    return [
        FATE.LONG_TUPLE,
        tuple.size - 16,
        ...elements
    ]
}

function serializeByteArray(byteArray) {
    if (byteArray.length === 0) {
        return [FATE.EMPTY_STRING]
    }

    if (byteArray.length < 64) {
        const lenBin = (byteArray.length << 2)
        const prefix = (byteArray.length << 2) | FATE.SHORT_STRING
        // console.log(
        //     "serialized byteArray (len, lenbin, shlbin, prefix, prefixbin):",
        //     byteArray.length,
        //     byteArray.length.toString(2).padStart(8, '0'),
        //     lenBin.toString(2).padStart(8, '0'),
        //     prefix,
        //     prefix.toString(2).padStart(8, '0')
        // )

        return [
            prefix,
            ...byteArray
        ]
    }
}

function serialize(type, value) {
    switch(type) {
        case 'bool':
            // assert value === !!value
            return (value === true) ? [FATE.TRUE] : [FATE.FALSE]
            break;
        case 'int':
            return serializeInt(value)
            break;
        default:
            console.error("Unsupported type: " + type)
    }
}

function serializeInt(value) {

}

function encodeContractByteArray(byteArray) {
    return 'cb_' + base64check.encode(byteArray)
}

console.log(
    "calldata init()",
    encodeContractByteArray(createCalldata("init", []))
)

console.log(
    "calldata main(true, false)",
    encodeContractByteArray(createCalldata("main", [true, false]))
)

console.log(
    "calldata main(false, true)",
    encodeContractByteArray(createCalldata("main", [false, true]))
)

console.log(
    "calldata main2(42)",
    encodeContractByteArray(createCalldata("main", [42]))
)