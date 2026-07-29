#!/bin/bash

# Update packages
dnf update -y

# Install Docker
dnf install docker -y

# Enable Docker service
systemctl enable docker

# Start Docker
systemctl start docker

# Allow ec2-user to use Docker
usermod -aG docker ec2-user

# Verify Docker installation
docker --version > /home/ec2-user/docker-version.txt
