import {Injectable} from './ioc/Container';
import {SecretsManager} from 'aws-sdk';

// @ts-ignore
const p: any = process;

export class LambdaConfig implements Injectable {
    static DefaultRegion ='us-east-1';
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
        LAMBDA_SNS_ERROR_ARN: 'LAMBDA_SNS_ERROR_ARN',
        AWS_SECRET_ARN: 'AWS_SECRET_ARN',
        REGION: 'REGION',
        CONFIG_JSON: 'CONFIG_JSON',
        CORS_ALLOW: 'CORS_ALLOW',
    };
    public sqsQueueUrl: string | undefined;
    public snsErrorArn: string | undefined;
    public awsRegion: string;
    public corsAllow: string;
    public secrets: { [key: string]: string } = {};
    public custom: any;
    constructor(private secretManager: SecretsManager) {
        this.awsRegion = p.env[LambdaConfig.Envs.REGION] || LambdaConfig.DefaultRegion;
        this.custom = p.env[LambdaConfig.Envs.CONFIG_JSON] ? JSON.parse(p.env[LambdaConfig.Envs.CONFIG_JSON]) : {};
        this.corsAllow = p.env[LambdaConfig.Envs.CORS_ALLOW];
    }

    async init(): Promise<void> {
        this.sqsQueueUrl = p.env[LambdaConfig.Envs.LAMBDA_SQS_QUEUE_URL];
        this.snsErrorArn = p.env[LambdaConfig.Envs.LAMBDA_SNS_ERROR_ARN];

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