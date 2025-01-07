FROM node:22-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd AS build
WORKDIR /app
COPY dist/apps/iam-service/package.json .
COPY dist/apps/iam-service/yarn.lock .
RUN yarn install --frozen-lockfile


FROM ghcr.io/ebizbase/node-distroless:latest@sha256:2d35608f1516d8f86b2d4bfbf0c8c2c80c4c820f227cf707b96407f5f369f9f8
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
COPY --from=build /app/node_modules ./node_modules
COPY dist/apps/iam-service .
CMD [ "main.js" ]
