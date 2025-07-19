FROM node:22

RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Now copy the rest of the app
COPY . .

# Fix for "externally-managed-environment" error
RUN pip3 install --break-system-packages -r requirements.txt

EXPOSE 5000

CMD ["node", "server.js"]