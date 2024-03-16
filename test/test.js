const exec = require('child_process').exec;
const join = require('path').join;
const fs = require('fs');
const { encodeAbiParameters, decodeAbiParameters } = require('viem');

const paramsAbi = [
    {
        name: 'staticStruct',
        inputs: [
            {
                components: [
                    {
                        name: 'winningRandomNumber',
                        type: 'uint256',
                    },
                    {
                        name: 'lastAwardedDrawId',
                        type: 'uint24',
                    },
                    {
                        name: 'vault',
                        type: 'address',
                    },
                    {
                        name: 'tier',
                        type: 'uint8',
                    },
                    {
                        name: 'tierPrizeCount',
                        type: 'uint32',
                    },
                    {
                        name: 'tierOdds',
                        type: 'uint256',
                    },
                    {
                        name: 'vaultPortion',
                        type: 'uint256',
                    },
                    {
                        name: 'vaultTotalSupplyTwab',
                        type: 'uint256',
                    },
                    {
                        name: 'user',
                        type: 'address[]',
                    },
                    {
                        name: 'userTwab',
                        type: 'uint256[]',
                    },
                ],
                name: 'Params',
                type: 'tuple',
            },
        ],
    }
];

const winnersAbi = [
    {
        name: "winnersArray",
        inputs: [
            {
                name: "winners",
                type: "tuple[]",
                components: [
                    {
                        name: "user",
                        type: "address",
                    },
                    {
                        name: "prizeIndex",
                        type: "uint32",
                    }
                ]
            }
        ],
    }
];

const calculateWinners = () => {
    return new Promise((resolve, reject) => {
        const scriptPath = join(__dirname, "../sol/script/WinnerCalc.s.sol");
        const configPath = join(__dirname, "../sol/foundry.toml");
        const cachePath = join(__dirname, "../sol/cache");
        const paramFile = join(__dirname, "../sol/files/testParams.txt");
        const outputFile = join(__dirname, "../sol/files/testOutput.txt");
        const data = encodeAbiParameters(
            paramsAbi[0].inputs,
            [{
                winningRandomNumber: 98988806060024828444893357647991488527011332739840374052279046490129044577820n,
                lastAwardedDrawId: 148,
                vault: "0xce8293f586091d48a0ce761bbf85d5bcaa1b8d2b",
                tier: 5,
                tierPrizeCount: 4**5,
                tierOdds: 1000000000000000000n,
                vaultPortion: 34067088114445756n,
                vaultTotalSupplyTwab: 24425159752779896488473n,
                user: ["0xe0e7b7c5ae92fe94d2ae677d81214d6ad7a11c27"],
                userTwab: [4900000000000000000000n]
            }]
        );
        fs.writeFileSync(paramFile, data);
        exec(`export FWC_PARAM_FILENAME="${paramFile}" && export FWC_OUTPUT_FILENAME="${outputFile}" && forge script ${scriptPath}:WinnerCalcScript --config-path ${configPath} --cache-path ${cachePath}`, (error, stdout, stderr) => {
            console.log(error, stdout, stderr);
            if (error ?? stderr) {
                reject(error ?? stderr);
            } else {
                const winnersHexString = fs.readFileSync(outputFile, 'utf-8');
                const winners = decodeAbiParameters(
                    winnersAbi[0].inputs,
                    winnersHexString
                );
                resolve(winners);
            }
        });
    });
};

const main = async () => {
    const winners = await calculateWinners();
    console.log(winners);
};
main();