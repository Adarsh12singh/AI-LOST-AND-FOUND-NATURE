FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy the backend source code
COPY . /app

# Set up a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "run:app", "--host", "0.0.0.0", "--port", "8000"]
