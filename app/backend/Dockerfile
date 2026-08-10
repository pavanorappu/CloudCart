# Base Image
FROM python:3.11-slim-bookworm

# Working Directory
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install application dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Upgrade vulnerable Python packages
RUN pip install --no-cache-dir --upgrade \
        "setuptools>=78.1.1" \
        "msgpack>=1.2.1" \
        wheel

# Copy application code
COPY . .

# Expose Flask port
EXPOSE 5000

# Start application
CMD ["python", "app.py"]
