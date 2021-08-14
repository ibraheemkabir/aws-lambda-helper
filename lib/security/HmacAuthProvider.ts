import { hmac } from "ferrum-crypto";
import { AuthenticationProvider, AuthenticationVerifyer, HexString, ValidationUtils } from "ferrum-plumbing";

export class HmacAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
	constructor(private postData: string,
			private secret?: HexString,
			private publicKey?: string,
			private publicToSecret?: (k: string) => string,
		) {
	}

    asHeader(): { key: string; value: string } {
        return {key: 'Authorization', value: `hmac/${this.publicKey}/${this.hash()}`};
    }

	private hash() {
		ValidationUtils.isTrue(!!this.secret, 'secrer is required for hmac');
		return hmac(this.secret!, this.postData);
	}

    getAuthSession(): string {
        return '';
    }

    isValid(headers: any): boolean {
		throw new Error('Cannot validate hmac synchronously')
    }

    async isValidAsync(headers: any): Promise<boolean> {
		const auth = headers['Authorization'] || headers['authorization'];
		if (!auth) { return false; }
		const [prefix, pubKey, hash] = auth.split('/');
		if (prefix !== 'hmac' || !pubKey || !hash) { return false; }
		ValidationUtils.isTrue(!!this.publicToSecret, 'publicToSecret not set');
		this.secret = await this.publicToSecret!(pubKey);
		if (!this.secret) { return false; }
		return this.hash() === hash;
    }

    verify(headers: any): void {
		throw new Error('Cannot validate hmac synchronously')
    }

	async verifyAsync(headers: any): Promise<void> {
        ValidationUtils.isTrue(await this.isValid(headers), 'Unauthorized');
	}
}