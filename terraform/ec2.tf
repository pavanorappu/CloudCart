# -------------------------
# EC2 Instance
# -------------------------
resource "aws_instance" "cloudcart_server" {

  ami = "ami-0c783070b2e26d98c"

  instance_type = var.instance_type

  subnet_id = aws_subnet.public_subnet.id

  vpc_security_group_ids = [aws_security_group.cloudcart_sg.id]

  key_name = var.key_name

  associate_public_ip_address = true

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Name = "${var.project_name}-Server"
  }

}
