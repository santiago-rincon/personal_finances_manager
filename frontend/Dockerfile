FROM node:20-alpine3.19 as build

WORKDIR /app

COPY package.json .

RUN npm install -g pnpm
RUN pnpm i

COPY . .

RUN pnpm run build

FROM nginx:stable-alpine-slim

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY --from=build /app/nginx/default.conf  /etc/nginx/conf.d/default.conf

ENV USERNAME=guest
ENV PASSWORD=guest

RUN apk add openssl
RUN echo -n "$USERNAME:" >> /etc/nginx/.htpasswd
RUN openssl passwd -apr1 "$PASSWORD" >> /etc/nginx/.htpasswd