FROM node:20-alpine3.19
WORKDIR /app
COPY package.json .
RUN npm install -g pnpm
RUN pnpm i
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD [ "pnpm", "run", "start:prod" ]
