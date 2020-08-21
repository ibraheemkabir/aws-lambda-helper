import { HexString, Injectable, LocalCache, ValidationUtils } from "ferrum-plumbing";
// @ts-ignore
import * as erc20Abi from './resources/IERC20.json'
import Web3 from 'web3';
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";

export type Web3ProviderConfig = { [network: string]: string };

const PROVIDER_TIMEOUT = 1000 * 3600;

export class Web3Utils {
    static TRANSACTION_TIMEOUT = 36 * 1000;
    static DEFAULT_APPROVE_GAS = 60000;

    static isZeroAddress(val: string) {
        return !val || !val.replace(/[0xX]*/,'').length;
    }

    static zX(str: string): string {
        if (str.startsWith('0x')) { return str; }
        return str;
    }
}

export class EthereumSmartContractHelper implements Injectable {
    private cache: LocalCache;
    constructor(
        private provider: Web3ProviderConfig,
    ) {
        this.cache = new LocalCache();
    }

    __name__() { return 'EthereumSmartContractHelper'; }

    async getTransactionStatus(network: string, tid: string, submissionTime: number):
        Promise<'timedout' | 'failed' | 'pending' | 'successful'> {
        const web3 = this.web3(network);
        const t = await web3.getTransaction(tid);
        if (!t && (submissionTime + Web3Utils.TRANSACTION_TIMEOUT > Date.now()) ) {
            return 'timedout';
        }
        if (!t.blockNumber) {
            return 'pending';
        }
        const receipt = await web3.getTransactionReceipt(tid);
        return !!receipt.status ? 'successful' : 'failed';
    }

    public async approveRequests(
        currency: string,
        approver: string,
        value: string,
        approvee: string,
        approveeName: string,
        nonce?: number,
        ): Promise<[number, CustomTransactionCallRequest[]]> {
        ValidationUtils.isTrue(!!approver, "'approver' must be provided");
        ValidationUtils.isTrue(!!approvee, "'approvee' must be provided");
        ValidationUtils.isTrue(!!approveeName, "'approveeName' must be provided");
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!value, "'value' must be provided");
        const network = currency.split(':')[0];
        const token = currency.split(':')[1];
        const tokDecimalFactor = 10 ** await this.decimals(network, token);
        const amount = new Big(value).times(new Big(tokDecimalFactor));
        nonce = nonce || await this.web3(network).getTransactionCount(approver, 'pending');
        const amountHuman = amount.div(tokDecimalFactor).toString();
        const symbol = await this.symbol(network, token);
        let requests: CustomTransactionCallRequest[] = [];
        return await this.addApprovesToRequests(requests, nonce!,
            network, amount, amountHuman, token, symbol, currency, approver, approvee, approveeName);
    }

    private async addApprovesToRequests(requests: CustomTransactionCallRequest[],
            nonce: number,
            network: string,
            amount: Big,
            amountHuman: string,
            token: string,
            symbol: string,
            currency: string,
            address: string,
            approvee: string,
            approveeName: string,
            ): Promise<[number, CustomTransactionCallRequest[]]> {
        const currentAllowance = await this.currentAllowance(network, token, address, approvee);
        if (currentAllowance.lt(amount)) {
            let approveGasOverwite: number = 0;
            if (currentAllowance.gt(new Big(0))) {
                const [approveToZero, approveToZeroGas] = await this.approveToZero(network, token, address,
                    approvee);
                requests.push(
                    EthereumSmartContractHelper.callRequest(token, currency, address, approveToZero,
                        approveToZeroGas.toString(), nonce,
                        `Zero out the approval for ${symbol} by ${approveeName}`,),
                        );
                nonce++;
                approveGasOverwite = approveToZeroGas;
            }
            const [approve, approveGas] = await this.approve(network,
                token, address, amount, approvee, approveGasOverwite);
            requests.push(
                EthereumSmartContractHelper.callRequest(token, currency, address, approve, approveGas.toString(), nonce,
                    `Approve ${amountHuman} ${symbol} to be spent by ${approveeName}`,)
            );
            nonce++;
        }
        return [nonce, requests];
    }

    public async approveToZero(network: string, token: string, from: string, approvee: string): Promise<[HexString, number]> {
        const m = this.erc20(network, token).methods.approve(approvee, '0');
        const gas = await m.estimateGas({from});
        return [m.encodeABI(), gas];
    }

    public async approve(network: string, token: string, from: string,
            rawAmount: Big, approvee: string, useThisGas: number): Promise<[HexString, number]> {
        console.log('about to approve: ', { from, token, approvee, amount: rawAmount.toFixed(), })
        const m = this.erc20(network, token).methods.approve(approvee, rawAmount.toFixed());
        const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) : await m.estimateGas({from});
        return [m.encodeABI(), gas];
    }

    public async currentAllowance(network: string, token: string, from: string, approvee: string) {
        const allowance = await this.erc20(network, token).methods.allowance(from, approvee).call();
        const bAllownace = new Big(allowance.toString());
        console.log('current allowance is ', bAllownace.toString(), ' for ', approvee, 'from', from);
        return bAllownace;
    }

    public async symbol(network: string, token: string): Promise<string> {
        return this.cache.getAsync('SYMBOLS_' + token, async () => {
            const tokenCon = this.erc20(network, token);
            return await tokenCon.methods.symbol().call();
        });
    }

    public async decimals(network: string, token: string): Promise<number> {
        return this.cache.getAsync('DECIMALS_' + token, async () => {
            const tokenCon = this.erc20(network, token);
            return await tokenCon.methods.decimals().call();
        });
    }

    public erc20(network: string, token: string) {
        const web3 = this.web3(network);
        return new web3.Contract(erc20Abi.default, token);
    }

    public web3(network: string) {
        ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
            prov = new Web3(new Web3.providers.HttpProvider( this.provider[network])).eth;
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
    }

    public static callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number,
        description: string): CustomTransactionCallRequest {
        return {
            currency,
            from,
            amount: '0',
            contract,
            data,
            gas: { gasPrice: '0', gasLimit },
            nonce,
            description,
        };
    }
}