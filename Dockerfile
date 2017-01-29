FROM nginx:alpine
COPY app/index.html /usr/share/nginx/html
COPY dist /usr/share/nginx/html/dist
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
