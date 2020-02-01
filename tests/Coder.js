const fs = require('fs')
const test = require('ava');
const Coder = require('../Coder.js')

test.before(async t => {
    const aci = JSON.parse(fs.readFileSync('build/identity.json', 'utf-8'))
    const coder = Object.create(Coder)

    t.context.aci = aci[0].contract
    t.context.coder = coder
});

test('Encode implicit init', t => {
    const encoded = t.context.coder.encode(t.context.aci, 'init', [])
    t.is(encoded, 'cb_KxFE1kQfP4oEp9E=', 'init()')
});

test('Encode empty arguments', t => {
    const encoded = t.context.coder.encode(t.context.aci, 'test_empty', [])
    t.is(encoded, 'cb_KxFLLL5rP7TGyoM=', 'test_empty()')
});

test('Encode boolean arguments', t => {
    const encoded = t.context.coder.encode(t.context.aci, 'test_bool', [true, false])
    t.is(encoded, 'cb_KxGhC8WIK/9/56SENg==', 'test_bool(true, false)')
});
