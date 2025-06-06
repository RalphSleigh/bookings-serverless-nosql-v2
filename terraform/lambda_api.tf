data "archive_file" "lambda_zip" {
  type               = "zip"
  source_file = "${path.module}/../dist-lambda/handler.mjs"
  output_path        = "${path.module}/files/api-lambda.zip"
}

resource "aws_s3_object" "lambda_code" {
  bucket   = aws_s3_bucket.lambda_code.id
  key      = data.archive_file.lambda_zip.output_md5
  source   = data.archive_file.lambda_zip.output_path
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/function_api_handler"
  retention_in_days = 14
}

resource "aws_lambda_function" "api_lambda" {
  function_name = "function_api_handler"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "handler.handler"

  s3_bucket = aws_s3_bucket.lambda_code.id
  s3_key    = data.archive_file.lambda_zip.output_md5

  architectures = ["arm64"]
  memory_size   = 512
  timeout       = 60

  #layers = [resource.aws_lambda_layer_version.common_layer.arn, resource.aws_lambda_layer_version.node_modules_layer.arn, "arn:aws:lambda:eu-west-2:282860088358:layer:AWS-AppConfig-Extension-Arm64:11"]
  #layers = [resource.aws_lambda_layer_version.node_modules_layer.arn]

  environment {
    variables = {
      workspace = terraform.workspace
      log_arm   = resource.aws_cloudwatch_log_stream.booking_system_logs.arn
      #EMAIL_QUEUE_URL = aws_sqs_queue.email_queue.id
      #DRIVE_SYNC_QUEUE_URL = aws_sqs_queue.drive_sync_queue.id
      #SNS_QUEUE_ARN = aws_sns_topic.lambda-errors.arn
      #DISCORD_QUEUE_URL = aws_sqs_queue.discord_queue.id
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_policy_attachment,
    aws_s3_object.lambda_code
  ]

  runtime = "nodejs22.x"
}

resource "aws_lambda_permission" "api_gateway_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "function_api_handler"
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_rest_api.gateway.execution_arn}/*/*"

  depends_on = [aws_lambda_function.api_lambda]
}
