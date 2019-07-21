# Lambda package plumbing

## Init script

To initialize a new package based on lambda plumbing:

```
$ ./bin/initialize-package.sh ../my-new-lambda

$ cd ../my-new-lambda
$ npm i
$ npm run [build | test | deploy]
```

## Lambda helper

This libary has some helper functionality, and uses dependency injection for quickly setting up lambda functions.

You need to implement your own handlers and register them in the index.ts

## Steps to get a website up and running

1. Create a lambda function in AWS console. Name it `public_<your_name>_<app_name>`
2. Use `basic_lambda_access` as the execution role
3. Create an API endpoin for the lambda function (from AWS console)
4. Run `./bin/initialize-package.sh <PATH_TO_YOUR_PACKAGE>`
5. Your package is set. Open it in your browser, build, deploy, and upload the .zip to your lambda function

You need to implement `LambdaHttpHandler`. Request and reponses are types making it easier to write the code.
