const { connect, createDataItemSigner } = require('@permaweb/aoconnect');
const https = require('https');

const MU_URL = "https://mu.ao-testnet.xyz";//https://mu.ao-testnet.xyz  https://mu50.ao-testnet.xyz
const CU_URL = "https://cu.ao-testnet.xyz";//https://cu.ao-testnet.xyz  https://cu100.ao-testnet.xyz
// const GATEWAY_URL = "https://arweave.net";
const GATEWAY_URL = "https://ar-io.net/";
const DEFAULT_MODULE = "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0";
const DEFAULT_SCHEDULER = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

function getRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const checkApiStatus = (apiUrl, timeout) => {
    return new Promise((resolve, reject) => {
        const request = https.get(apiUrl, (response) => {
            const { statusCode } = response;
            if (statusCode >= 200 && statusCode < 300) {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        request.on('error', (err) => {
            reject(err);
        });

        request.setTimeout(timeout, () => {
            request.abort();
            reject(new Error('Request timed out'));
        });
    });
}

const AoCheckMuUrl = () => {
    for(let i=1; i<=50; i++) {
        const apiUrl = `https://mu${i}.ao-testnet.xyz`; // 替换为你的API的URL
        const timeout = 5000; // 超时时间，单位是毫秒
        checkApiStatus(apiUrl, timeout)
            .then((isUp) => {
                if (isUp) {
                    console.log(`${apiUrl}: success`);
                } else {
                    console.log(`${apiUrl}: fail`);
                }
            })
            .catch((err) => {
                console.error(`${apiUrl}: Error checking API status:`, err.message);
            });
    }
}


const AoCheckCuUrl = () => {
    for(let i=1; i<=100; i++) {
        const apiUrl = `https://cu${i}.ao-testnet.xyz`; // 替换为你的API的URL
        const timeout = 5000; // 超时时间，单位是毫秒
        checkApiStatus(apiUrl, timeout)
            .then((isUp) => {
                if (isUp) {
                    console.log(`${apiUrl}: success`);
                } else {
                    console.log(`${apiUrl}: fail`);
                }
            })
            .catch((err) => {
                console.error(`${apiUrl}: Error checking API status:`, err.message);
            });
    }
}

const AoMuUrlLoadBalance = () => {
    return `https://mu${getRandomNumber(1,50)}.ao-testnet.xyz`
    // return `https://mu.ao-testnet.xyz`
}

const AoCuUrlLoadBalance = () => {
    return `https://cu${getRandomNumber(1,100)}.ao-testnet.xyz`
    return `https://cu.ao-testnet.xyz`
}

const AoSendMsg = async (currentWalletJwk, processTxId, Msg, Tags) => {
    const { message } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const sendMsgResult = await message({
        process: processTxId,
        tags: Tags,
        signer: createDataItemSigner(currentWalletJwk),
        data: Msg,
    });
    console.log("handleSendMsg sendMsgResult", sendMsgResult);

    return sendMsgResult;
};

const AoMsgResult = async (MsgId, ProcessTxId) => {
    const { result } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    //读取消息ID返回的数据
    let msgResult = await result({
        message: MsgId,
        process: ProcessTxId,
    });
    return msgResult;
};

const AoSendMsgReturnResult = async (currentWalletJwk, processTxId, Msg, Tags) => {
    const msgId = await AoSendMsg(currentWalletJwk, processTxId, Msg, Tags);
    return await AoMsgResult(msgId, processTxId);
};

//https://cu.ao-testnet.xyz/results/A__Gs3KRlvDWfPDRjHL_56D70U65rAvnsuGGpgpKmTY?sort=DESC&limit=10
const AoGetLastPage = async (processTxId, Sort = 'DESC', Limit = 25) => {
    const { results } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const resultsOut = await results({
        process: processTxId,
        sort: Sort,
        limit: Limit,
    });

    return resultsOut;
};

const AoGetPageRecord = async (processTxId, Sort = 'DESC', Limit = 25, From = '') => {
    const { results } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const resultsOut = await results({
        process: processTxId,
        from: From && From !== '' ? From : undefined,
        sort: Sort,
        limit: Limit,
    });
    return resultsOut;
};

const AoCreateProcess = async (currentWalletJwk, moduleTxId=DEFAULT_MODULE, scheduler=DEFAULT_SCHEDULER, Tags) => {
    const { spawn } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const processTxId = await spawn({
        module: moduleTxId,
        scheduler: scheduler,
        signer: createDataItemSigner(currentWalletJwk),
        tags: Tags,
    });

    console.log("AoCreateProcess processTxId", processTxId);

    return processTxId;
};

const AoDryRun = async (currentWalletJwk, processTxId, Data, Tags) => {
    const { dryrun } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const result = await dryrun({
        process: processTxId,
        data: Data,
        tags: [{ name: 'Action', value: 'Balance' }],
        anchor: '1234'
    });

    console.log("AoDryRun result", result);

    return result;
};

const AoMonitor = async (currentWalletJwk, processTxId) => {
    const { monitor } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const result = await monitor({
        process: processTxId,
        signer: createDataItemSigner(currentWalletJwk),
    });

    console.log("AoMonitor result", result);

    return result;
};

const AoUnMonitor = async (currentWalletJwk, processTxId) => {
    const { unmonitor } = connect({ MU_URL: AoMuUrlLoadBalance(), CU_URL: AoCuUrlLoadBalance(), GATEWAY_URL });

    const result = await unmonitor({
        process: processTxId,
        signer: createDataItemSigner(currentWalletJwk),
    });

    console.log("AoUnMonitor result", result);

    return result;
};

//通过接口去获取
const AoGetPageRecordByApi = async (processTxId, Sort = 'DESC', Limit = 25, From = '') => {
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    const response = await fetch(`https://cu.ao-testnet.xyz/results/${processTxId}?sort=DESC&limit=10`, requestOptions)
    const result = await response.json();
    // console.info(result)
    return result;
}

//获取一个地址的所有process  name=aos 的Name
//https://g8way.io/graphql
const AoQueryProcesses = async (address, name='') => {
    const headers = {
        'Content-Type': 'application/json',
    };

    let processList = [];
    let afterCursor = null;

    while (true) {
        const jsonData = {
            variables: {
                addresses: [`${address}`],
                first: 100,  // 每页项目数量
                after: afterCursor  // 开始的游标，如果是第一页，设为 null
            },
            query: `query ($addresses:[String!]!, $first: Int!, $after: String) {
                transactions (
                    first: $first,
                    after: $after,
                    owners: $addresses, 
                    tags: [
                        { name: "Data-Protocol", values: ["ao"] },
                        { name: "Variant", values: ["ao.TN.1"] },
                        { name: "Type", values: ["Process"]},
                        { name: "Name", values: ["${name}"]}
                    ]
                ) {
                    edges {
                        node {
                            id
                            tags {
                                name
                                value
                            }
                            
                        }
                        cursor
                    }
                }
            }`
        };

        const response = await fetch('https://arweave-search.goldsky.com/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        // console.log(jsonData);
        // console.log(result);

        // 检查是否有数据
        if (result.data.transactions.edges.length === 0) {
            break;
        }

        // 处理当前页的数据
        for (const info of result.data.transactions.edges) {

            const processInfo = info.node.tags.reduce((obj, item) => {
                obj[item.name] = item.value;
                return obj;
            }, {});
            processInfo.id = info.node.id
            processList.push(processInfo);
        }

        // 更新游标为当前页的最后一个节点的游标
        afterCursor = result.data.transactions.edges[result.data.transactions.edges.length - 1].cursor;
    }

    return processList;
}

export default {
    AoMuUrlLoadBalance,
    AoCuUrlLoadBalance,
    AoSendMsg,
    AoMsgResult,
    AoSendMsgReturnResult,
    AoGetLastPage,
    AoGetPageRecord,
    AoCreateProcess,
    AoDryRun,
    AoMonitor,
    AoUnMonitor,
    AoGetPageRecordByApi,
    AoQueryProcesses,
    AoCheckMuUrl,
    AoCheckCuUrl,

    GATEWAY_URL,
    DEFAULT_MODULE,
    DEFAULT_SCHEDULER,
};
