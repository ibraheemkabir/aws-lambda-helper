import { HandlerFactory } from './HandlerFactory';
import { LambdaGlobalContext } from './LambdaGlobalContext';
import { LambdaConfig } from './LambdaConfig';
import {SecretsManager, SNS, SQS, KMS, CloudWatch} from 'aws-sdk';
import { Container, Module, makeInjectable } from 'ferrum-plumbing';
import {AwsEnvs} from "./aws/Types";

export class LambdaGlobalModule implements Module {
  async configAsync(container: Container): Promise<void> {
        // @ts-ignore
    const region = process.env.REGION || LambdaConfig.DefaultRegion;
    const secretManager = new SecretsManager({ region });
    const config = new LambdaConfig(secretManager);
    await config.init();
    makeInjectable('SQS', SQS);
    makeInjectable('KMS', KMS);
    container.register(SQS, () => new SQS({region: process.env[AwsEnvs.AWS_DEFAULT_REGION]}));
    makeInjectable('SNS', SNS);
    makeInjectable('CloudWatch', CloudWatch);
    container.register(SNS, () => new SNS({region: process.env[AwsEnvs.AWS_DEFAULT_REGION]}));
    container.register(KMS, () => new KMS({region: process.env[AwsEnvs.AWS_DEFAULT_REGION]}));
    container.register(CloudWatch, () => new CloudWatch({region: process.env[AwsEnvs.AWS_DEFAULT_REGION]}));
    container.register(LambdaConfig, () => config);
    container.registerLifecycleParent(HandlerFactory,
      c => new HandlerFactory(c.get('LambdaSqsHandler'), c.get('LambdaHttpHandler')));
    container.register(LambdaGlobalContext, c => new LambdaGlobalContext(c.get(HandlerFactory)));
  }
}
