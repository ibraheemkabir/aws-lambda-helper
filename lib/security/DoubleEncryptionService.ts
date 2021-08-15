import { EncryptedData, HexString, Injectable, ValidationUtils } from "ferrum-plumbing";
import { KmsCryptor } from "lib/aws/KmsCryptor";
import { TwoFaEncryptionClient } from "./TwoFaEncryptionClient";

export class DoubleEncryptiedSecret implements Injectable {
	private _secret: string = '';
	constructor(
		private ksmCryptor: KmsCryptor,
		private twoFaCryptor: TwoFaEncryptionClient,
	) {
	}

	__name__() { return 'DoubleEncryptionService'; }

	async init(twoFaId: string, twoFa: string, data: EncryptedData) {
		const unwrap1 = await this.twoFaCryptor.decrypt(twoFaId, twoFa, data);
		const [key, value] = unwrap1.split('|+|', 2);
		ValidationUtils.isTrue(!!key && !!value, 'Could not decrypt data with twoFa');
		this._secret = await this.ksmCryptor.decryptToHex({key, data: value});
		ValidationUtils.isTrue(!!this._secret, 'Could not decrypt data with KMS');
	}

	async encrypt(twoFaId: string, twoFa: string, clearText: HexString): Promise<EncryptedData> {
		const secret1 = await this.ksmCryptor.encryptHex(clearText);
		const msg = `${secret1.key}|+|${secret1.data}`;
		return await this.twoFaCryptor.encrypt(twoFaId, twoFa, msg);
	}

	secret(): HexString {
		ValidationUtils.isTrue(!!this._secret, 'secret is not initialzied');
		return this._secret;
	}
}