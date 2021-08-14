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
const ferrum_crypto_1 = require("ferrum-crypto");
const ferrum_plumbing_1 = require("ferrum-plumbing");
class HmacAuthProvider {
    constructor(postData, secret, publicKey, publicToSecret) {
        this.postData = postData;
        this.secret = secret;
        this.publicKey = publicKey;
        this.publicToSecret = publicToSecret;
    }
    asHeader() {
        return { key: 'Authorization', value: `hmac/${this.publicKey}/${this.hash()}` };
    }
    hash() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.secret, 'secrer is required for hmac');
        return ferrum_crypto_1.hmac(this.secret, this.postData);
    }
    getAuthSession() {
        return '';
    }
    isValid(headers) {
        throw new Error('Cannot validate hmac synchronously');
    }
    isValidAsync(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = headers['Authorization'] || headers['authorization'];
            if (!auth) {
                return false;
            }
            const [prefix, pubKey, hash] = auth.split('/');
            if (prefix !== 'hmac' || !pubKey || !hash) {
                return false;
            }
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.publicToSecret, 'publicToSecret not set');
            this.secret = yield this.publicToSecret(pubKey);
            if (!this.secret) {
                return false;
            }
            return this.hash() === hash;
        });
    }
    verify(headers) {
        throw new Error('Cannot validate hmac synchronously');
    }
    verifyAsync(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(yield this.isValid(headers), 'Unauthorized');
        });
    }
}
exports.HmacAuthProvider = HmacAuthProvider;
//# sourceMappingURL=HmacAuthProvider.js.map