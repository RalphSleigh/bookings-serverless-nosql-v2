/*
resource "aws_sqs_queue" "email_queue" {
  name                       = "email-queue"
  visibility_timeout_seconds = 300
}

data "archive_file" "email_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../dist-lambda/lambdas/email/email.mjs"
  output_path = "${path.module}/files/email-lambda.zip"
}

resource "aws_s3_object" "email_lambda_code" {
  bucket = aws_s3_bucket.lambda_code.id
  key    = data.archive_file.email_lambda_zip.output_md5
  source = data.archive_file.email_lambda_zip.output_path
}

resource "aws_cloudwatch_log_group" "email_lambda_log_group" {
  name              = "/aws/lambda/function_email"
  retention_in_days = 14
}

resource "aws_lambda_function" "email_lambda" {
  function_name = "function_email"
  role          = aws_iam_role.email_lambda_role.arn
  handler       = "email.lambdaHandler"

  s3_bucket = aws_s3_bucket.lambda_code.id
  s3_key    = resource.aws_s3_object.email_lambda_code.key

  architectures = ["arm64"]
  memory_size   = 256
  timeout       = 900
  reserved_concurrent_executions = 1

  layers = [resource.aws_lambda_layer_version.node_modules_layer.arn]

  environment {
    variables = {
      workspace = terraform.workspace
      log_arm   = resource.aws_cloudwatch_log_stream.booking_system_logs.arn
      EMAIL_QUEUE_URL = aws_sqs_queue.email_queue.id
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_policy_attachment,
  ]

  runtime = "nodejs20.x"
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  event_source_arn = aws_sqs_queue.email_queue.arn
  enabled          = true
  function_name    = aws_lambda_function.email_lambda.arn
  batch_size       = 1
}

data "aws_iam_policy_document" "email_lambda_role_iam_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "email_lambda_role" {
  name               = "EmailLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.email_lambda_role_iam_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_role_policy" {
  role       = aws_iam_role.email_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

resource "aws_iam_role_policy_attachment" "email_standard_lambda_policy_attachment" {
  role       = aws_iam_role.email_lambda_role.name
  policy_arn = aws_iam_policy.lambda_execution_policy.arn
} */