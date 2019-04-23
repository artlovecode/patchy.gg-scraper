FROM python:3.7-stretch
RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
