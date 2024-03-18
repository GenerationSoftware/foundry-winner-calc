# PoolTogether Foundry Winner Calculator

A foundry-assisted toolkit for efficiently calculating winners of a prize pool draw.

## Installation

1. clone this repo
2. install [foundry](https://book.getfoundry.sh/getting-started/installation)
3. run `npm i` and then `npm run build`
4. navigate to the `sol` directory and run `forge install` and then `forge build`

> **WINDOWS INSTALLATION** If you are installing on windows, you may need to increase your max filepath setting on git ***before running forge install*** by running the following command as administrator: `git config --system core.longpaths true`

## How to Calculate Winners for each Vault

> This script batches RPC queries for a given vault, so you'll need to run it for each vault that you want to check prizes for.

### Step 1

Compile a list of potential winners that you want to check against, a given prize pool and vault combo and save the info to a file in the following format:

> example-input.json
```json
{
  "chainId": 10,
  "prizePoolAddress": "0xe32e5E1c5f0c80bD26Def2d0EA5008C107000d6A",
  "vaultAddress": "0xf0B19f02c63d51B69563A2b675e0160e1C34397C",
  "userAddresses": [
    "0xf54d071e929c02eb097cbf284e6e6a8bb924f2a7",
    "0x12dc4da5037152f97adc89a54c855e9bc84eeb7d",
    "0x299c8c6d973506fbf9245d95773d6ca1c5ccbfb3"
  ]
}
```

> You can optionally define a `multicallBatchSize` argument in the input json file to limit multicall sizes for your RPC calls. Some RPC enforce "gas" limits on read calls and will only accept certain batch sizes:
```json
{
  "multicallBatchSize": 50
}
```

### Step 2

Define your desired RPC URL as a local environment variable like so:

`FWC_RPC_URL="https://my-rpc.xyz"`

### Step 3

Run the `index.js` script and pass in your input file path and desired output file path:

`node index.js example-input.json example-output.json`

When the script finishes, the results will be written to your output file location in the following format:

```json
{
  "winners": [
    {
      "user": "0x12Dc4dA5037152F97aDC89a54C855e9bc84eEB7d",
      "prizes": {
        "5": [
          451,
          685,
          941
        ]
      }
    }
  ]
}
```
