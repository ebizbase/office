FROM busybox AS tools
ARG BUSYBOX_VERSION=1.31.0-i686-uclibc
ADD https://busybox.net/downloads/binaries/$BUSYBOX_VERSION/busybox_WGET /wget
RUN chmod a+x /wget


FROM node:22-alpine@sha256:96cc8323e25c8cc6ddcb8b965e135cfd57846e8003ec0d7bcec16c5fd5f6d39f AS build
WORKDIR /app
COPY dist/apps/mailer-service/package.json .
COPY dist/apps/mailer-service/yarn.lock .
RUN yarn install --frozen-lockfile


FROM ghcr.io/ebizbase/node-distroless:latest@sha256:2d35608f1516d8f86b2d4bfbf0c8c2c80c4c820f227cf707b96407f5f369f9f8

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app
COPY --from=tools /wget /usr/bin/wget
COPY --from=build /app/node_modules ./node_modules
COPY dist/apps/mailer-service .

CMD [ "main.js" ]
