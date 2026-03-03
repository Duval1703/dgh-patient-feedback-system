# Stage 1: Build with Node (Vite/React)
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN rm -rf node_modules package-lock.json
RUN npm install
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Removes default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Use custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
