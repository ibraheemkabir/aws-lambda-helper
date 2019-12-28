import { KeyEncryptionProvider, WebNativeCryptor } from 'ferrum-crypto';
import { HexString, Injectable, InternalReactNativeEncryptedKey } from "ferrum-plumbing";
import { KMS } from 'aws-sdk';
export declare class KmsCryptor extends WebNativeCryptor implements Injectable, KeyEncryptionProvider {
    private kms;
    private cmkKeyId;
    constructor(kms: KMS, cmkKeyId: string);
    __name__(): string;
    protected decryptKey(key: InternalReactNativeEncryptedKey, overrideKey?: HexString): Promise<string>;
    protected newKey(overrideKey?: HexString): Promise<{
        encryptedKey: HexString;
        keyId: string;
        unEncrypedKey: string;
    }>;
    getKey(keyId?: string): string;
    newKeyId(): string;
    randomHex(keySize?: number): Promise<HexString>;
}
//# sourceMappingURL=KmsCryptor.d.ts.map