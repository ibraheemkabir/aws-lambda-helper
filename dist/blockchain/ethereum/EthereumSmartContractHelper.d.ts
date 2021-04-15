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
export declare function tryWithBytes32(web3: any, name: string, address: string, fun: () => Promise<any>): Promise<any>;
export declare class EthereumSmartContractHelper implements Injectable {
    private provider;
    private cache;
    constructor(provider: Web3ProviderConfig);
    __name__(): string;
    getTransactionStatus(network: string, tid: string, submissionTime: number): Promise<'timedout' | 'failed' | 'pending' | 'successful'>;
    approveMaxRequests(currency: string, approver: string, value: string, approvee: string, approveeName: string, nonce?: number): Promise<[number, CustomTransactionCallRequest[]]>;
    approveRequests(currency: string, approver: string, value: string, approvee: string, approveeName: string, nonce?: number): Promise<[number, CustomTransactionCallRequest[]]>;
    private _approveRequests;
    private addApprovesToRequests;
    approveToZero(currency: string, from: string, approvee: string): Promise<[HexString, number]>;
    approve(currency: string, from: string, rawAmount: Big, approvee: string, useThisGas: number): Promise<[HexString, number]>;
    currentAllowance(currency: string, from: string, approvee: string): Promise<Big>;
    amountToMachine(currency: string, amount: string): Promise<string>;
    amountToHuman(currency: string, amount: string): Promise<string>;
    symbol(currency: string): Promise<string>;
    decimals(currency: string): Promise<number>;
    erc20(network: string, token: string): any;
    web3(network: string): any;
    static callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number, description: string): CustomTransactionCallRequest;
    static parseCurrency(currency: string): [string, string];
    static toCurrency(network: string, token: string): string;
}
//# sourceMappingURL=EthereumSmartContractHelper.d.ts.map