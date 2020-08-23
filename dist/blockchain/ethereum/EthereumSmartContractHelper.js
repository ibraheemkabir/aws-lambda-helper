"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ferrum_plumbing_1 = require("ferrum-plumbing");
const IERC20_json_1 = __importDefault(require("./resources/IERC20.json"));
const web3_1 = __importDefault(require("web3"));
const big_js_1 = __importDefault(require("big.js"));
const PROVIDER_TIMEOUT = 1000 * 3600;
class Web3Utils {
    static isZeroAddress(val) {
        return !val || !val.replace(/[0xX]*/, '').length;
    }
    static zX(str) {
        if (str.startsWith('0x')) {
            return str;
        }
        return str;
    }
}
Web3Utils.TRANSACTION_TIMEOUT = 36 * 1000;
Web3Utils.DEFAULT_APPROVE_GAS = 60000;
exports.Web3Utils = Web3Utils;
class EthereumSmartContractHelper {
    constructor(provider) {
        this.provider = provider;
        this.cache = new ferrum_plumbing_1.LocalCache();
    }
    __name__() { return 'EthereumSmartContractHelper'; }
    getTransactionStatus(network, tid, submissionTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const web3 = this.web3(network);
            const t = yield web3.getTransaction(tid);
            if (!t && (submissionTime + Web3Utils.TRANSACTION_TIMEOUT > Date.now())) {
                return 'timedout';
            }
            if (!t.blockNumber) {
                return 'pending';
            }
            const receipt = yield web3.getTransactionReceipt(tid);
            return !!receipt.status ? 'successful' : 'failed';
        });
    }
    approveRequests(currency, approver, value, approvee, approveeName, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approver, "'approver' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approvee, "'approvee' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approveeName, "'approveeName' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!currency, "'currency' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!value, "'value' must be provided");
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const tokDecimalFactor = Math.pow(10, yield this.decimals(currency));
            const amount = new big_js_1.default(value).times(new big_js_1.default(tokDecimalFactor));
            nonce = nonce || (yield this.web3(network).getTransactionCount(approver, 'pending'));
            const amountHuman = amount.div(tokDecimalFactor).toString();
            const symbol = yield this.symbol(currency);
            let requests = [];
            return yield this.addApprovesToRequests(requests, nonce, network, amount, amountHuman, token, symbol, currency, approver, approvee, approveeName);
        });
    }
    addApprovesToRequests(requests, nonce, network, amount, amountHuman, token, symbol, currency, address, approvee, approveeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentAllowance = yield this.currentAllowance(currency, address, approvee);
            if (currentAllowance.lt(amount)) {
                let approveGasOverwite = 0;
                if (currentAllowance.gt(new big_js_1.default(0))) {
                    const [approveToZero, approveToZeroGas] = yield this.approveToZero(currency, address, approvee);
                    requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approveToZero, approveToZeroGas.toString(), nonce, `Zero out the approval for ${symbol} by ${approveeName}`));
                    nonce++;
                    approveGasOverwite = approveToZeroGas;
                }
                const [approve, approveGas] = yield this.approve(currency, address, amount, approvee, approveGasOverwite);
                requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approve, approveGas.toString(), nonce, `Approve ${amountHuman} ${symbol} to be spent by ${approveeName}`));
                nonce++;
            }
            return [nonce, requests];
        });
    }
    approveToZero(currency, from, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const m = this.erc20(network, token).methods.approve(approvee, '0');
            const gas = yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    approve(currency, from, rawAmount, approvee, useThisGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            console.log('aboutnetwork: string, token to approve: ', { from, token, approvee, amount: rawAmount.toFixed(), });
            const m = this.erc20(network, token).methods.approve(approvee, rawAmount.toFixed());
            const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) : yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    currentAllowance(currency, from, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const allowance = yield this.erc20(network, token).methods.allowance(from, approvee).call();
            const bAllownace = new big_js_1.default(allowance.toString());
            console.log('current allowance is ', bAllownace.toString(), ' for ', approvee, 'from', from);
            return bAllownace;
        });
    }
    amountToMachine(currency, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimal = yield this.decimals(currency);
            const decimalFactor = Math.pow(10, decimal);
            return new big_js_1.default(amount).times(decimalFactor).toFixed(0);
        });
    }
    amountToHuman(currency, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimal = yield this.decimals(currency);
            const decimalFactor = Math.pow(10, decimal);
            return new big_js_1.default(amount).div(decimalFactor).toFixed();
        });
    }
    symbol(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            return this.cache.getAsync('SYMBOLS_' + currency, () => __awaiter(this, void 0, void 0, function* () {
                const tokenCon = this.erc20(network, token);
                return yield tokenCon.methods.symbol().call();
            }));
        });
    }
    decimals(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            return this.cache.getAsync('DECIMALS_' + currency, () => __awaiter(this, void 0, void 0, function* () {
                const tokenCon = this.erc20(network, token);
                return yield tokenCon.methods.decimals().call();
            }));
        });
    }
    erc20(network, token) {
        const web3 = this.web3(network);
        return new web3.Contract(IERC20_json_1.default, token);
    }
    web3(network) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
            prov = new web3_1.default(new web3_1.default.providers.HttpProvider(this.provider[network])).eth;
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
    }
    static callRequest(contract, currency, from, data, gasLimit, nonce, description) {
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
    static parseCurrency(currency) {
        const ret = currency.split(':');
        ferrum_plumbing_1.ValidationUtils.isTrue(ret.length === 2, 'Invalid currency ' + currency);
        return [ret[0], ret[1]];
    }
    static toCurrency(network, token) {
        return `${network}:${token}`;
    }
}
exports.EthereumSmartContractHelper = EthereumSmartContractHelper;
//# sourceMappingURL=EthereumSmartContractHelper.js.map