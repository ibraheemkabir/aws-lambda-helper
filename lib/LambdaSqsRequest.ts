
export interface LambdaSqsRequestRecord {
  'messageId': string;
  'receiptHandle': string;
  'body': string;
  'attributes': {
    'ApproximateReceiveCount': number,
    'SentTimestamp': number,
    'SenderId': string,
    'ApproximateFirstReceiveTimestamp': number,
  };
  'messageAttributes': any;
  'md5OfBody': string;
  'eventSource': 'aws:sqs';
  'eventSourceARN': string;
  'awsRegion': string;
}

export interface LambdaSqsRequest {
  'Records': LambdaSqsRequestRecord[];
}
