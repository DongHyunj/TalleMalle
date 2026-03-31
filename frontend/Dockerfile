# 빌드 단계
#FROM node:24.12.0-slim AS builder
#
#WORKDIR /app
#
#ARG VITE_API_BASE_URL
#ARG VITE_WS_URL
#ARG VITE_KAKAO_MAP_KEY
#ARG VITE_PORTONE_STORE_ID
#ARG VITE_PORTONE_CHANNEL_KEY
#ARG VITE_VAPID_PUBLIC_KEY
#
#ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
#ENV VITE_WS_URL=${VITE_WS_URL}
#ENV VITE_KAKAO_MAP_KEY=${VITE_KAKAO_MAP_KEY}
#ENV VITE_PORTONE_STORE_ID=${VITE_PORTONE_STORE_ID}
#ENV VITE_PORTONE_CHANNEL_KEY=${VITE_PORTONE_CHANNEL_KEY}
#ENV VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY}
#
#COPY package*.json ./
#
#RUN npm install
#
#COPY ./ ./
#
#RUN npm run build

# 실행 단계
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
#COPY  /app/dist /usr/share/nginx/html
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
