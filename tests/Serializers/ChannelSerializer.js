const test = require('ava')
const ChannelSerializer = require('../../src/Serializers/ChannelSerializer.js')

const s = new ChannelSerializer()

test('Serialize', t => {
    t.deepEqual(
        s.serialize(BigInt("0xfedcba9876543210")),
        [159,5,136,254,220,186,152,118,84,50,16]
    )
});