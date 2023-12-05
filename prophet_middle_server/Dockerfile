FROM node:18.15.0
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "docker"]