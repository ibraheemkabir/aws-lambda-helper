import { Injectable } from './ioc/Container';
import { SecretsManager } from 'aws-sdk';
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
        AWS_SECRET_ARN: string;
        REGION: string;
    };
    sqsQueueUrl: string | undefined;
    awsRegion: string;
    secrets: {
        [key: string]: string;
    };
    constructor(secretManager: SecretsManager);
    init(): Promise<void>;
    __name__(): string;
}
//# sourceMappingURL=LambdaConfig.d.ts.map