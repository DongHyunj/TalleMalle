FROM nginx:latest
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]