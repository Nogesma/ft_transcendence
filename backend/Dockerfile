FROM node:16-alpine AS builder

ENV NODE_ENV production

WORKDIR /build/

COPY package.json yarn.lock .yarnrc.yml ./

COPY .yarn .yarn

RUN yarn install --immutable

COPY tsconfig.json tsconfig.build.json ./
COPY src src

RUN yarn run build


FROM node:16-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=builder /build/package.json /build/yarn.lock /build/.yarnrc.yml ./
COPY --from=builder /build/node_modules node_modules
COPY --from=builder /build/.yarn .yarn
COPY --from=builder /build/dist dist/

CMD ["yarn", "run", "start:prod"]
