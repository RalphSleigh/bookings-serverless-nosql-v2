resource "aws_api_gateway_rest_api" "gateway" {
  name = "Bookings API Gateway ${terraform.workspace}"
}

resource "aws_api_gateway_resource" "resource" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_rest_api.gateway.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.gateway.id
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.gateway.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.gateway.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_lambda.invoke_arn
}

/*
resource "aws_api_gateway_resource" "proxy" {
  for_each    = var.lambda_definitions
  rest_api_id = aws_api_gateway_rest_api.gateway.id
  #parent_id   = try(aws_api_gateway_resource.proxy[try(each.value.parent_key, "INVALID")].id, aws_api_gateway_rest_api.gateway.root_resource_id)
  parent_id = "parernt-id-is-hmmm"
  #path_part   = each.value.path_part
  path_part = "do we have a parent-key? ${try(each.value.parent_key, "no")} ok so the parent id is ${try(aws_api_gateway_resource.proxy[try(each.value.parent_key, "still no")], "nope")}"
}

resource "aws_api_gateway_method" "proxy" {
  for_each      = var.lambda_definitions
  rest_api_id   = aws_api_gateway_rest_api.gateway.id
  resource_id   = aws_api_gateway_resource.proxy[each.key].id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "gateway_lambda" {
  for_each    = local.filtered_lambdas
  rest_api_id = aws_api_gateway_rest_api.gateway.id
  resource_id = aws_api_gateway_method.proxy[each.key].resource_id
  http_method = aws_api_gateway_method.proxy[each.key].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda[each.key].invoke_arn
}

*/
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.gateway.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.gateway.body))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.method
  ]
}

resource "aws_api_gateway_stage" "example" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.gateway.id
  stage_name    = "api"
}
