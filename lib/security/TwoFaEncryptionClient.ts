import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, Fetcher, HexString, Injectable, JsonRpcRequest,
	LoggerFactory, ValidationUtils } from "ferrum-plumbing";
import { HmacAuthProvider } from "./HmacAuthProvider";

export class TwoFaEncryptionClient implements Injectable {
	private fetcher: Fetcher;
	constructor(
		private cyptor: WebNativeCryptor,
		private uri: string,
		logFac: LoggerFactory,
		private apiSecret: string,
		private apiPub: string,
	) {
		this.fetcher = new Fetcher(logFac);
	}

	__name__() { return 'TwoFaEncryptionClient'; }

	async encryp(twoFaId: string, twoFa: string, data: HexString): Promise<EncryptedData> {
		const wrapperKey = await this.getTwoFaWrapperKey(twoFaId, twoFa);
		return this.cyptor.encryptHex(data, wrapperKey);
	}

	async newKey(): Promise<{ keyId: string, secret: string }> {
		const req = JSON.stringify({ command: 'newTwoFaWrapperKey', data: {}, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider(req, this.apiSecret, this.apiPub);
		const res = await this.fetcher.fetch<{keyId: string, secret: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					...auth.asHeader(),
                },
            });
		ValidationUtils.isTrue(!!res && !!res.keyId, `Error calling ${this.uri}. No keyId returned`);
		return res;
	}

	async decrypt(twoFaId: string, twoFa: string, data: EncryptedData): Promise<HexString> {
		const wrapperKey = await this.getTwoFaWrapperKey(twoFaId, twoFa);
		return this.cyptor.decryptToHex(data, wrapperKey);
	}

	private async getTwoFaWrapperKey(keyId: string, twoFa: string): Promise<string> {
		const req = JSON.stringify({ command: 'getTwoFaWrapperKey', data: { keyId, twoFa }, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider(req, this.apiSecret, this.apiPub);
		const res = await this.fetcher.fetch<{wrapperKey: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					...auth.asHeader(),
                },
            });
		ValidationUtils.isTrue(!!res && !!res.wrapperKey, `Error calling ${this.uri}. No wrapper key returned`);
		return res.wrapperKey;
	}
}