"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ferrum_plumbing_1 = require("ferrum-plumbing");
// @ts-ignore
const erc20Abi = __importStar(require("./resources/IERC20.json"));
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
            const network = currency.split(':')[0];
            const token = currency.split(':')[1];
            const tokDecimalFactor = Math.pow(10, yield this.decimals(network, token));
            const amount = new big_js_1.default(value).times(new big_js_1.default(tokDecimalFactor));
            nonce = nonce || (yield this.web3(network).getTransactionCount(approver, 'pending'));
            const amountHuman = amount.div(tokDecimalFactor).toString();
            const symbol = yield this.symbol(network, token);
            let requests = [];
            [nonce, requests] = yield this.addApprovesToRequests(requests, nonce, network, amount, amountHuman, token, symbol, currency, approver, approvee, approveeName);
            return requests;
        });
    }
    addApprovesToRequests(requests, nonce, network, amount, amountHuman, token, symbol, currency, address, approvee, approveeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentAllowance = yield this.currentAllowance(network, token, address, approvee);
            if (currentAllowance.lt(amount)) {
                let approveGasOverwite = 0;
                if (currentAllowance.gt(new big_js_1.default(0))) {
                    const [approveToZero, approveToZeroGas] = yield this.approveToZero(network, token, address, amount, approvee);
                    requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approveToZero, approveToZeroGas.toString(), nonce, `Zero out the approval for ${symbol} by ${approveeName}`));
                    nonce++;
                    approveGasOverwite = approveToZeroGas;
                }
                const [approve, approveGas] = yield this.approve(network, token, address, amount, approvee, approveGasOverwite);
                requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approve, approveGas.toString(), nonce, `Approve ${amountHuman} ${symbol} to be spent by ${approveeName}`));
                nonce++;
            }
            return [nonce, requests];
        });
    }
    approveToZero(network, token, from, amount, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('about to approve: ', { token, to: approvee, amount: amount.toFixed(), });
            const m = this.erc20(network, token).methods.approve(approvee, '0');
            const gas = yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    approve(network, token, from, amount, approvee, useThisGas) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('about to approve: ', { token, to: approvee, amount: amount.toFixed(), });
            const m = this.erc20(network, token).methods.approve(approvee, amount.toFixed());
            const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) : yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    currentAllowance(network, token, from, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            const allowance = yield this.erc20(network, token).methods.allowance(from, approvee).call();
            const bAllownace = new big_js_1.default(allowance.toString());
            console.log('current allowance is ', bAllownace.toString(), ' for ', approvee, 'from', from);
            return bAllownace;
        });
    }
    symbol(network, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cache.getAsync('SYMBOLS_' + token, () => __awaiter(this, void 0, void 0, function* () {
                const tokenCon = this.erc20(network, token);
                return yield tokenCon.methods.symbol().call();
            }));
        });
    }
    decimals(network, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cache.getAsync('DECIMALS_' + token, () => __awaiter(this, void 0, void 0, function* () {
                const tokenCon = this.erc20(network, token);
                return yield tokenCon.methods.decimals().call();
            }));
        });
    }
    erc20(network, token) {
        const web3 = this.web3(network);
        return new web3.Contract(erc20Abi.default, token);
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
}
exports.EthereumSmartContractHelper = EthereumSmartContractHelper;
//# sourceMappingURL=EthereumSmartContractHelper.js.map