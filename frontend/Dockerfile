FROM node:16 AS builder

ENV NODE_ENV production

WORKDIR /build/

COPY package.json yarn.lock .yarnrc.yml ./

COPY .yarn .yarn

RUN yarn install --immutable

COPY .env \
    index.html \
    svelte.config.js \
    postcss.config.cjs \
    tailwind.config.cjs \
    tsconfig.json \
    tsconfig.node.json \
    vite.config.ts \
    ./

COPY src src
COPY public public

RUN yarn run build


FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /build/dist /srv
