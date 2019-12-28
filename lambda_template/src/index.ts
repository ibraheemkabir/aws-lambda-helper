import {
    LambdaGlobalContext,
    AwsEnvs, SecretsProvider, KmsCryptor, LambdaHttpHandler, LambdaHttpRequest, LambdaHttpResposne, LambdaSqsHandler,
    LambdaSqsRequest,
} from 'aws-lambda-helper';
import {ConsoleLogger, Logger, LoggerFactory, SecretAuthProvider, Container, Injectable, Module,} from "ferrum-plumbing";
import {JsonRpcHttpHandler} from "./JsonRpcHttpHandler";
import { KMS } from 'aws-sdk';

class ContainerProvider {
    static _container: Container|undefined = undefined;

    static async container(){
        if (!ContainerProvider._container) {
            ContainerProvider._container = await LambdaGlobalContext.container();
            await ContainerProvider._container.registerModule(new MyLambdaModule()); // Change this to your defined module
        }
        return ContainerProvider._container;
    }
}

// Once registered this is the handler code for lambda_template
export async function handler(event: any, context: any) {
    const container = await ContainerProvider.container();
    const lgc = container.get<LambdaGlobalContext>(LambdaGlobalContext);
    return await lgc.handleAsync(event, context);
}

// Implement your specific handlers in a separate file
export class EchoHttpHandler implements LambdaHttpHandler {
    async handle(request: LambdaHttpRequest, context: any): Promise<LambdaHttpResposne> {
        return {
            body: 'You did actually say ' + request.queryStringParameters['message'],
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/html',
            },
            statusCode: 200,
        } as LambdaHttpResposne
    }
}

// Implement your specific handlers in a separate file
export class BasicSqsHandler implements LambdaSqsHandler, Injectable {
    constructor(private log: Logger) {
    }

    async handle(request: LambdaSqsRequest, context: any) {
        const rec = request.Records[0];
        const { message, count } = JSON.parse(rec.body) as any;
        if (!message || !count) {
            // @ts-ignore
            this.log.error('handle:', request);
            throw new Error('No message found in the SQS request');
        }
        // @ts-ignore
        this.log.info('Received SQS message ', rec);
    }

    __name__(): string {
        return 'BasicSqsHandler';
    }
}

export class MyLambdaModule implements Module {
    async configAsync(container: Container) {
        container.register(LoggerFactory, c => new LoggerFactory(cn => new ConsoleLogger(cn)));

        container.register('LambdaHttpHandler', () => new EchoHttpHandler());
        container.register("LambdaSqsHandler", c => new BasicSqsHandler(
            c.get<LoggerFactory>(LoggerFactory).getLogger(BasicSqsHandler)));

        // Uncomment to use a typical JSON RPC setup
        // const region = process.env[AwsEnvs.AWS_DEFAULT_REGION] || 'us-east-2';
        // const secretConfArn = getEnv(AwsEnvs.AWS_SECRET_ARN_PREFIX + 'YOUR_CUSTOM_SUFFIX');
        // const config = await new SecretsProvider(region, secretConfArn).get() as any;
        // container.register('LambdaHttpHandler',
        //     c => new JsonRpcHttpHandler(c.get(JsonRpcHttpHandler),new SecretAuthProvider(config.secret)));

        // Unocomment this if you need encryption
        // container.register('KMS', () => new KMS({region}));
        // container.register(KmsCryptor, c => new KmsCryptor(c.get('KMS'), config.cmkKeyArn));
    }
}
