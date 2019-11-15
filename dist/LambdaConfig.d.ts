import { SecretsManager } from 'aws-sdk';
import { Injectable } from 'ferrum-plumbing';
export interface AwsConfig {
    /**
     * The endpoint URI to send requests to. The default endpoint is built from the configured region.
     * The endpoint should be a string like 'https://{service}.{region}.amazonaws.com'.
     */
    region?: string;
    sqsQueue?: string;
}
export declare class LambdaConfig implements Injectable {
    private secretManager;
    static DefaultRegion: string;
    static Keys: {
        FirebaseJson: string;
        FirebaseProjectId: string;
        SendGridApiKey: string;
        MongoHost: string;
        MongoDatabase: string;
        MongoPassword: string;
        MongoUser: string;
    };
    static Envs: {
        LAMBDA_SQS_QUEUE_URL: string;
        LAMBDA_SNS_ERROR_ARN: string;
        AWS_SECRET_ARN: string;
        REGION: string;
        CONFIG_JSON: string;
        CORS_ALLOW: string;
    };
    sqsQueueUrl: string | undefined;
    snsErrorArn: string | undefined;
    awsRegion: string;
    corsAllow: string;
    secrets: {
        [key: string]: string;
    };
    custom: any;
    constructor(secretManager: SecretsManager);
    init(): Promise<void>;
    __name__(): string;
}
//# sourceMappingURL=LambdaConfig.d.ts.map