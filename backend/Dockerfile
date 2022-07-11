FROM node:16-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./

RUN sed -i '$ d' .yarnrc.yml

COPY .yarn .yarn/
RUN yarn

COPY dist dist/

CMD ["yarn", "run", "start:prod"]
