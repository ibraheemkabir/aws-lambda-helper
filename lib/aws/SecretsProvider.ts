import {SecretsManager} from 'aws-sdk';
import { GetSecretValueRequest, GetRandomPasswordRequest } from 'aws-sdk/clients/secretsmanager';
import {ValidationUtils} from "ferrum-plumbing";

export class SecretsProvider {
    constructor(private region: string, private secretArn: string) { }
    async get(): Promise<any> {
        const manager = new SecretsManager({region: this.region});
        const res = await manager.getSecretValue({
            SecretId: this.secretArn,
        } as GetSecretValueRequest).promise();
        ValidationUtils.isTrue(!!res.SecretString, 'Secret is empty');
        return JSON.parse(res.SecretString!);
    }

    async randomPassword(len: number): Promise<string> {
        const manager = new SecretsManager({region: this.region});
        const res = await manager.getRandomPassword({
            PasswordLength: len,
        } as GetRandomPasswordRequest).promise();
        return res.RandomPassword!;
    }
}