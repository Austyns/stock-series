FROM node:8

# Create adapter directory
WORKDIR /usr/src/adapter

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
