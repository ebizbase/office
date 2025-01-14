#!/bin/bash

# Kiểm tra xem có ít nhất một tên service được truyền vào không
if [ $# -lt 1 ]; then
  echo "Usage: $0 <service_name> <service_name>..."
  exit 1
fi

# Chuẩn bị danh sách các service
SERVICES="$@"

# Thực hiện build tất cả các service bằng nx run-many
echo "Building services: $SERVICES"
nx run-many -t build -p $SERVICES
if [ $? -ne 0 ]; then
  echo "Error: Failed to build services: $SERVICES"
  exit 1
fi

# Khởi chạy tất cả các service bằng Docker Compose
echo "Starting services: $SERVICES with Docker Compose"
docker compose up -d --wait $SERVICES
if [ $? -ne 0 ]; then
  echo "Error: Failed to start services: $SERVICES"
  exit 1
fi

echo "Services $SERVICES have been successfully built and started."
