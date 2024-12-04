FROM node:22-alpine@sha256:b64ced2e7cd0a4816699fe308ce6e8a08ccba463c757c00c14cd372e3d2c763e AS build
WORKDIR /app
COPY dist/apps/services/mailer-service/package.json .
COPY dist/apps/services/mailer-service/yarn.lock .
RUN yarn install --frozen-lockfile


FROM ghcr.io/ebizbase/node-distroless:latest@sha256:2d35608f1516d8f86b2d4bfbf0c8c2c80c4c820f227cf707b96407f5f369f9f8
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
COPY --from=build /app/node_modules ./node_modules
COPY dist/apps/services/mailer-service .
CMD [ "main.js" ]
