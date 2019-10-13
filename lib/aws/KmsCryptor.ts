import {
    hexToArrayBuffer,
    KeyEncryptionProvider,
    WebNativeCryptor,
    arrayBufferToHex
} from 'ferrum-crypto';
import {HexString, Injectable, InternalReactNativeEncryptedKey} from "ferrum-plumbing";
import {KMS} from 'aws-sdk';
import { DecryptRequest, GenerateDataKeyResponse, DecryptResponse } from "aws-sdk/clients/kms";

export class KmsCryptor extends WebNativeCryptor implements Injectable {
    constructor(private kms: KMS) {
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
        const encKey = await this.kms.generateDataKey().promise() as GenerateDataKeyResponse;
        const encKeyHex = arrayBufferToHex(encKey.Plaintext as Uint8Array);
        const unEncryptedKey = arrayBufferToHex(encKey.CiphertextBlob as Uint8Array);
        return { encryptedKey: encKeyHex, keyId: '', unEncrypedKey: unEncryptedKey };
    }
}
