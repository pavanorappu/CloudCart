variable "aws_region" {
  description = "AWS Region where CloudCart infrastructure will be created"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "AWS EC2 Key Pair Name"
  type        = string
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "CloudCart"
}
