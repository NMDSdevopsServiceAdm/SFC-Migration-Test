FROM --platform=linux/amd64 node:alpine

WORKDIR /app

COPY ./backend/package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "new-start"]