# -------------------------
# VPC
# -------------------------
resource "aws_vpc" "cloudcart_vpc" {

  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "${var.project_name}-VPC"
  }

}

# -------------------------
# Public Subnet
# -------------------------
resource "aws_subnet" "public_subnet" {

  vpc_id = aws_vpc.cloudcart_vpc.id

  cidr_block = "10.0.1.0/24"

  availability_zone = "eu-north-1b"

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-Public-Subnet"
  }

}

# -------------------------
# Internet Gateway
# -------------------------
resource "aws_internet_gateway" "igw" {

  vpc_id = aws_vpc.cloudcart_vpc.id

  tags = {
    Name = "${var.project_name}-IGW"
  }

}

# -------------------------
# Route Table
# -------------------------
resource "aws_route_table" "public_rt" {

  vpc_id = aws_vpc.cloudcart_vpc.id

  route {

    cidr_block = "0.0.0.0/0"

    gateway_id = aws_internet_gateway.igw.id

  }

  tags = {
    Name = "${var.project_name}-Public-RouteTable"
  }

}
# -------------------------
# Route Table Association
# -------------------------
resource "aws_route_table_association" "public_rt_assoc" {

  subnet_id = aws_subnet.public_subnet.id

  route_table_id = aws_route_table.public_rt.id

}
