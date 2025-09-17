FROM gcc:latest
WORKDIR /app
RUN apt-get update && apt-get install -y nodejs npm
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]