FROM node:20-alpine3.18

COPY package*.json ./

RUN npm install

COPY index.js index.js

EXPOSE 4040

CMD ["node", "index.js"]