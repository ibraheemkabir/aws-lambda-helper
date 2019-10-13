import { HandlerFactory } from './HandlerFactory';
import { LambdaGlobalContext } from './LambdaGlobalContext';
import { LambdaConfig } from './LambdaConfig';
import { SecretsManager, SNS, SQS, KMS } from 'aws-sdk';
import { Container, Module, makeInjectable } from 'ferrum-plumbing';

export class LambdaGlobalModule implements Module {
  async configAsync(container: Container): Promise<void> {
        // @ts-ignore
    const region = process.env.REGION || LambdaConfig.DefaultRegion;
    const secretManager = new SecretsManager({ region });
    const config = new LambdaConfig(secretManager);
    await config.init();
    makeInjectable('SQS', SQS);
    makeInjectable('KMS', KMS);
    container.register(SQS, () => new SQS());
    makeInjectable('SNS', SNS);
    container.register(SNS, () => new SNS());
    container.register(LambdaConfig, () => config);
    container.register(HandlerFactory,
      c => new HandlerFactory(c.get('LambdaSqsHandler'), c.get('LambdaHttpHandler')));
    container.register(LambdaGlobalContext, c => new LambdaGlobalContext(c.get(HandlerFactory)));
  }
}
