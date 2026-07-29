terraform {
  backend "s3" {
    bucket         = "cloudcart-terraform-state-323668150536"
    key            = "cloudcart/dev/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "cloudcart-terraform-locks"
    encrypt        = true
  }
}
