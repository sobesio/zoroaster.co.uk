FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
