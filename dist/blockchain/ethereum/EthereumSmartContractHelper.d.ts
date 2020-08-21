import { HexString, Injectable } from "ferrum-plumbing";
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
export declare type Web3ProviderConfig = {
    [network: string]: string;
};
export declare class Web3Utils {
    static TRANSACTION_TIMEOUT: number;
    static DEFAULT_APPROVE_GAS: number;
    static isZeroAddress(val: string): boolean;
    static zX(str: string): string;
}
export declare class EthereumSmartContractHelper implements Injectable {
    private provider;
    private cache;
    constructor(provider: Web3ProviderConfig);
    __name__(): string;
    getTransactionStatus(network: string, tid: string, submissionTime: number): Promise<'timedout' | 'failed' | 'pending' | 'successful'>;
    approveRequests(currency: string, approver: string, value: string, approvee: string, approveeName: string, nonce?: number): Promise<[number, CustomTransactionCallRequest[]]>;
    private addApprovesToRequests;
    approveToZero(network: string, token: string, from: string, approvee: string): Promise<[HexString, number]>;
    approve(network: string, token: string, from: string, rawAmount: Big, approvee: string, useThisGas: number): Promise<[HexString, number]>;
    currentAllowance(network: string, token: string, from: string, approvee: string): Promise<Big>;
    symbol(network: string, token: string): Promise<string>;
    decimals(network: string, token: string): Promise<number>;
    erc20(network: string, token: string): any;
    web3(network: string): any;
    static callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number, description: string): CustomTransactionCallRequest;
}
//# sourceMappingURL=EthereumSmartContractHelper.d.ts.map