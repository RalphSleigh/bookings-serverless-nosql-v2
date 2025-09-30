resource "aws_sqs_queue" "async_task_queue" {
  name                       = "async-task-queue.fifo"
  visibility_timeout_seconds = 900
  fifo_queue = true
  content_based_deduplication = true
}

resource "aws_sqs_queue" "async_task_dead_letter_queue" {
  name = "async-task-dead-letter-queue"
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.async_task_queue.arn]
  })
}

resource "aws_sqs_queue_redrive_policy" "q" {
  queue_url = aws_sqs_queue.async_task_queue.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.async_task_dead_letter_queue.arn
    maxReceiveCount     = 4
  })
}

data "archive_file" "async_task_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../dist-lambda/asyncTaskHandler.mjs"
  output_path = "${path.module}/files/async-task-lambda.zip"
}

resource "aws_s3_object" "async_task_lambda_code" {
  bucket = aws_s3_bucket.lambda_code.id
  key    = data.archive_file.async_task_lambda_zip.output_md5
  source = data.archive_file.async_task_lambda_zip.output_path
}

resource "aws_cloudwatch_log_group" "async_task_lambda_log_group" {
  name              = "/aws/lambda/function_async_task"
  retention_in_days = 14
}

resource "aws_lambda_function" "async_task_lambda" {
  function_name = "function_async_task"
  role          = aws_iam_role.async_task_lambda_role.arn
  handler       = "asyncTaskHandler.handler"

  s3_bucket = aws_s3_bucket.lambda_code.id
  s3_key    = resource.aws_s3_object.async_task_lambda_code.key

  architectures = ["arm64"]
  memory_size   = 1024
  timeout       = 900
  reserved_concurrent_executions = 1

  environment {
    variables = {
      workspace = terraform.workspace
      log_arm   = resource.aws_cloudwatch_log_stream.booking_system_logs.arn
      ASYNC_TASK_QUEUE_URL = aws_sqs_queue.async_task_queue.id
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_policy_attachment,
  ]

  runtime = "nodejs22.x"
}

resource "aws_lambda_event_source_mapping" "async_task_event_source_mapping" {
  event_source_arn = aws_sqs_queue.async_task_queue.arn
  enabled          = true
  function_name    = aws_lambda_function.async_task_lambda.arn
  function_response_types = [ "ReportBatchItemFailures" ]
}

data "aws_iam_policy_document" "async_task_lambda_role_iam_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "async_task_lambda_role" {
  name               = "AsyncTaskLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.async_task_lambda_role_iam_policy.json
}

resource "aws_iam_role_policy_attachment" "async_task_lambda_sqs_role_policy" {
  role       = aws_iam_role.async_task_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

resource "aws_iam_role_policy_attachment" "async_task_lambda_policy_attachment_built_in" {
  role       = aws_iam_role.async_task_lambda_role.name
  policy_arn = aws_iam_policy.lambda_async_execution_policy.arn
}

data "aws_iam_policy_document" "lambda_async_exec_role_policy" {
  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.lambda-errors.arn]
  }

  statement {
    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
      "dynamodb:GetItem",
      "dynamodb:GetRecords",
      "dynamodb:ListTables",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "dynamodb:UpdateTable",
    ]

    resources = [aws_dynamodb_table.bookings_table.arn, "${aws_dynamodb_table.bookings_table.arn}/index/*", aws_dynamodb_table.config_table.arn]
    effect = "Allow"
  }
}

resource "aws_iam_policy" "lambda_async_execution_policy" {
  name   = "lambda__async_execution_policy"
  path   = "/"
  policy = data.aws_iam_policy_document.lambda_async_exec_role_policy.json
}