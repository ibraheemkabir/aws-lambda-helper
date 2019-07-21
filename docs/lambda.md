# Process to create a lambda function and with AWS gateway and SQS

1. Create node lambda function, don't use template
  Considerations: permissions required to create lambda functions.
  TODO: Create a standard policy: Access to some safe secrets. Plus all SQS
2. Set exe role to basic_lambda_role
3. Add API gateway trigger
4. TODO: Add a lambda authenticator for auth using tokens


## Creating a queue

- Go to SQS and create a queue starting with the name `public_`

## Deploying

```$bash
$ yarn build
$ 

```