"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ferrum_plumbing_1 = require("ferrum-plumbing");
const HmacAuthProvider_1 = require("./HmacAuthProvider");
class TwoFaEncryptionClient {
    constructor(cyptor, uri, logFac, apiSecret, apiPub) {
        this.cyptor = cyptor;
        this.uri = uri;
        this.apiSecret = apiSecret;
        this.apiPub = apiPub;
        this.fetcher = new ferrum_plumbing_1.Fetcher(logFac);
    }
    __name__() { return 'TwoFaEncryptionClient'; }
    encryp(twoFaId, twoFa, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrapperKey = yield this.getTwoFaWrapperKey(twoFaId, twoFa);
            return this.cyptor.encryptHex(data, wrapperKey);
        });
    }
    newKey() {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'newTwoFaWrapperKey', data: {}, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider(req, this.apiSecret, this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.keyId, `Error calling ${this.uri}. No keyId returned`);
            return res;
        });
    }
    decrypt(twoFaId, twoFa, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrapperKey = yield this.getTwoFaWrapperKey(twoFaId, twoFa);
            return this.cyptor.decryptToHex(data, wrapperKey);
        });
    }
    getTwoFaWrapperKey(keyId, twoFa) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'getTwoFaWrapperKey', data: { keyId, twoFa }, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider(req, this.apiSecret, this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.wrapperKey, `Error calling ${this.uri}. No wrapper key returned`);
            return res.wrapperKey;
        });
    }
}
exports.TwoFaEncryptionClient = TwoFaEncryptionClient;
//# sourceMappingURL=TwoFaEncryptionClient.js.map