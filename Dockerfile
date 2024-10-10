FROM node:latest
WORKDIR /app
COPY package.json .
COPY . .
RUN npm run build
RUN npm install 
EXPOSE 3000
CMD [ "node", "./dist/index.js" ]