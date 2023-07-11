FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine AS final
WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY package*.json .
COPY tsconfig*.json .
RUN npm ci --omit=dev
CMD ["npm", "start"]