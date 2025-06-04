resource "aws_cloudwatch_log_group" "booking_system_logs" {
  name =  "bookings_system_logs"
}

resource "aws_cloudwatch_log_stream" "booking_system_logs" {
  name           = "system"
  log_group_name = aws_cloudwatch_log_group.booking_system_logs.name
}