# Lambda package plumbing

## Init script

To initialize a new package based on lambda plumbing:

```
$ ./bin/initialize-package.sh ../my-new-lambda

$ cd ../my-new-lambda
$ npm i
$ npm run [build | test | deploy | deploy-prod]
```

## Lambda helper

This libary has some helper functionality, and uses dependency injection for quickly setting up lambda functions.

You need to implement your own handlers and register them in the index.ts

```

import {LambdaGlobalContext} from 'ferrum-plumbing-lambda';
import {container} from "tsyringe";

// Register your handlers
container.register("LambdaHttpHandler", {
  useClass: MyHttpHandler
});
container.register("LambdaSqsHandler", {
  useClass: MySqsHandler
});

// Once registered this is the handler code for lambda
exports.handler = async function(event: any, context: any) {
  const lgc = container.resolve(LambdaGlobalContext);
  return await lgc.handleAsync(event, context);
}

// Implement your specific handlers in a separate file
export class MyHttpHandler implements LambdaHttpHandler {
  async handle(request: LambdaHttpRequest, context: any) {
     ...
  }
}

// Implement your specific handlers in a separate file
export class MySqsHandler implements LambdaSqsHandler {
  async handle(request: LambdaSqsHandler, context: any) {
     ...
  }
}

```

## TODOs

- Write script to deploy the function
- Push to git
- Finish the init-repository.sh
- Write an example using `init-repository` that pulls the
dependency from git as well
