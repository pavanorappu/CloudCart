# -------------------------
# EC2 Public IP
# -------------------------
output "public_ip" {

  description = "Public IP of CloudCart EC2"

  value = aws_instance.cloudcart_server.public_ip

}

# -------------------------
# EC2 Public DNS
# -------------------------
output "public_dns" {

  description = "Public DNS of CloudCart EC2"

  value = aws_instance.cloudcart_server.public_dns

}

# -------------------------
# EC2 Instance ID
# -------------------------
output "instance_id" {

  description = "EC2 Instance ID"

  value = aws_instance.cloudcart_server.id

}
