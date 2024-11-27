FROM node:20-alpine AS build
WORKDIR /app
COPY dist/apps/api/package.json .
COPY dist/apps/api/yarn.lock .
RUN yarn install --frozen-lockfile


FROM ghcr.io/ebizbase/node-distroless:latest
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
COPY --from=build /app/node_modules ./node_modules
COPY dist/apps/api .
CMD [ "main.js" ]
