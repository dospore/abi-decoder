
const { ethers } = require('ethers');
const abiDecoder = require('abi-decoder');
const abis = require('./abis');
const util = require('util')

const args = require('yargs').argv;

const knownNetworks = [421611];

const providers = {
    '42161': 'https://arb-mainnet.g.alchemy.com/v2/g9udwmlsS0yy_rx_he5QABNq0poIKnzq',
    '421611': 'https://arb-rinkeby.g.alchemy.com/v2/ltKzsemL_EEefOWvo_hQHDgW9cKONX4M'
}

const network = args.network;
if (!network) {
    console.log('Usage: yarn decode --network=421611')
    process.exit();
} else if (!knownNetworks.includes(network)) {
    console.log("Unknown network: network must be included in", knownNetworks);
    process.exit();
}

const provider = new ethers.providers.JsonRpcProvider(providers[network]);

const transactions = [
    "0x9cb8752544c01eb590529737b9914f6c6a97eebeae8a4639009980fce39a5c78",
    "0x4e38732d10ce473ea0185733f9b660f5eec6e9496a5a657a8d27c758901fa394",
]

Object.values(abis).forEach((abi) => {
    abiDecoder.addABI(abi);
})

const decode = async () => {
    transactions.forEach(async (txnHash) => {
        const [txn, receipt] = await Promise.all([
            provider.getTransaction(txnHash),
            provider.getTransactionReceipt(txnHash)
        ])
        if (!receipt) {
            console.log("Failed to fetch transaction receipt");
            return;
        }
        const decodedMethod = abiDecoder.decodeMethod(txn.data);
        const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
        console.log('\n\n')
        console.log(`Logs for ${txnHash}`)
        console.log(util.inspect(decodedMethod, {showHidden: false, depth: null, colors: true}))
        console.log(util.inspect(decodedLogs, {showHidden: false, depth: null, colors: true}))
        console.log('\n\n')
    })
}

decode()
