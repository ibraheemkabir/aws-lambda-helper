import {
    hexToArrayBuffer,
    KeyEncryptionProvider,
    WebNativeCryptor,
    arrayBufferToHex, Algo
} from 'ferrum-crypto';
import {HexString, Injectable, InternalReactNativeEncryptedKey} from "ferrum-plumbing";
import {KMS} from 'aws-sdk';
import {DecryptRequest, GenerateDataKeyResponse, DecryptResponse, GenerateRandomRequest} from "aws-sdk/clients/kms";

export class KmsCryptor extends WebNativeCryptor implements Injectable, KeyEncryptionProvider {
    constructor(private kms: KMS, private cmkKeyId: string) {
        super({} as KeyEncryptionProvider);
    }

    __name__(): string {return 'KmsCryptor';}

    protected async decryptKey(key: InternalReactNativeEncryptedKey, overrideKey?: HexString) {
        const decKey = await this.kms.decrypt({
            CiphertextBlob: hexToArrayBuffer(key.key),
        } as DecryptRequest).promise() as DecryptResponse;
        return arrayBufferToHex(decKey.Plaintext as Uint8Array);
    }

    protected async newKey(overrideKey?: HexString):
        Promise<{ encryptedKey: HexString, keyId: string, unEncrypedKey: string }> {
        const encKey = await this.kms.generateDataKey(
            { KeyId: this.cmkKeyId, NumberOfBytes: Algo.SIZES.KEY_SIZE, }).promise() as GenerateDataKeyResponse;
        const unEncryptedKey = arrayBufferToHex(encKey.Plaintext as Uint8Array);
        const encKeyHex = arrayBufferToHex(encKey.CiphertextBlob as Uint8Array);
        return { encryptedKey: encKeyHex, keyId: this.cmkKeyId, unEncrypedKey: unEncryptedKey };
    }

    getKey(keyId?: string): string {
        return '';
    }

    newKeyId(): string {
        return this.cmkKeyId;
    }

    async randomHex(keySize?: number): Promise<HexString> {
        const res = await this.kms.generateRandom({
            CustomKeyStoreId: this.cmkKeyId,
            NumberOfBytes: 32,
        } as GenerateRandomRequest).promise();
        return arrayBufferToHex(res.Plaintext as Uint8Array);
    }
}
