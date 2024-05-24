const Arweave = require('arweave');

const arweave = Arweave.init();

const createWallet = async () => {
    const jwk = await arweave.wallets.generate();
    return jwk
};

const getAddressByJwk = async (jwk) => {
    const address = await arweave.wallets.jwkToAddress(jwk);
    return address;
}

const isAddress = (address) => {
    return !!address?.match(/^[a-z0-9_-]{43}$/i)
}

const getWalletBalance = async (Address) => {
    return arweave.ar.winstonToAr(await arweave.wallets.getBalance(Address))
}

const getWalletBalanceWinston = async (Address) => {
    return await arweave.wallets.getBalance(Address)
}

const getPrice = async (byteSize) => {
    return arweave.ar.winstonToAr(await arweave.transactions.getPrice(byteSize))
}

module.exports = {
    createWallet,
    isAddress,
    getAddressByJwk,
    getAddressByFilePath,
    getJwkByFilePath,
    getWalletBalance,
    getWalletBalanceWinston,
    getPrice
};
