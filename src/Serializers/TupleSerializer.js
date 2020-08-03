const FateTag = require('../FateTag.js')
const FateInt = require('../types/FateInt.js')
const FateTuple = require('../types/FateTuple.js')

const zip = (arr, ...arrs) => {
  return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
}

class TupleSerializer {
    constructor(globalSerializer) {
        this.globalSerializer = globalSerializer
    }
    serialize(tuple) {
        const len = tuple.size
        if (len === 0) {
            return [FateTag.EMPTY_TUPLE]
        }

        const elements = tuple.items
            .map(e => this.globalSerializer.serialize(e))
            .flat(Infinity)

        if (len < 16) {
            const prefix = (len << 4) | FateTag.SHORT_TUPLE

            return [
                prefix,
                ...elements
            ]
        }

        return [
            FateTag.LONG_TUPLE,
            ...this.globalSerializer.serialize(new FateInt(len - 16)),
            ...elements
        ]
    }
    deserialize(data, typeInfo) {
        const [value, rest] = this.deserializeStream(data, typeInfo)

        return value
    }
    deserializeStream(data, typeInfo) {
        const buffer = new Uint8Array(data)
        const prefix = buffer[0]
        let len = 0n
        let rest = buffer.slice(1)

        if (prefix === FateTag.EMPTY_TUPLE) {
            return [new FateTuple(), rest]
        }

        if ((prefix & 0x0F) === FateTag.SHORT_TUPLE) {
            len = (prefix & 0xF0) >> 4
        }

        if (prefix === FateTag.LONG_TUPLE) {
            [len, rest] = this.globalSerializer.deserializeStream(buffer.slice(1))
            len += 16n
        }

        let valueTypes = []
        if (typeof typeInfo !== 'undefined') {
            valueTypes = typeInfo.valueTypes
        }

        let elements = []
        let el = null
        for (let i = 0n; i < len; i++) {
            [el, rest] = this.globalSerializer.deserializeStream(rest, valueTypes[i])
            elements.push(el)
        }

        let type = typeInfo
        if (typeof typeInfo === 'undefined') {
            type = elements.map(e => e.type)
        }

        return [
            new FateTuple(type, elements),
            rest
        ]
    }
}

module.exports = TupleSerializer
