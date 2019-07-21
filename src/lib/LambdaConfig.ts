import {Injectable} from './ioc/Container';
import {SecretsManager} from 'aws-sdk';

// @ts-ignore
const p: any = process;

export class LambdaConfig implements Injectable {
    static DefaultRegion = 'us-east-1';
    static Keys = {
        FirebaseJson: 'firebase_json',
        FirebaseProjectId: 'firebase_project_id',
        SendGridApiKey: 'send_grid_api_key',
        MongoHost: 'mongo_host',
        MongoDatabase: 'mongo_database',
        MongoPassword: 'mongo_password',
        MongoUser: 'mongo_user',
    };
    static Envs = {
        LAMBDA_SQS_QUEUE_URL: 'LAMBDA_SQS_QUEUE_URL',
        AWS_SECRET_ARN: 'AWS_SECRET_ARN',
        REGION: 'REGION',
    };
    public sqsQueueUrl: string | undefined;
    public awsRegion: string;
    public secrets: { [key: string]: string } = {};
    constructor(private secretManager: SecretsManager) {
        this.awsRegion = p.env[LambdaConfig.Envs.REGION] || LambdaConfig.DefaultRegion;
    }

    async init(): Promise<void> {
        this.sqsQueueUrl = p.env[LambdaConfig.Envs.LAMBDA_SQS_QUEUE_URL];

        const secretId = p.env[LambdaConfig.Envs.AWS_SECRET_ARN];
        if (secretId) {
            const secret = await this.secretManager.getSecretValue({ SecretId: secretId }).promise();
            this.secrets = { ...this.secrets, ...JSON.parse(secret.SecretString!)}
        }
    }

    __name__(): string {
        return 'LambdaConfig';
    }
}