FROM node:18

ADD . /app/tmp

WORKDIR /app/tmp

RUN yarn && yarn build

WORKDIR /app

COPY /prisma .

RUN mv tmp/dist/* . && mv tmp/package.json . && mv tmp/node_modules . && mv tmp/.env .

RUN rm -rf tmp

EXPOSE 80

CMD ["yarn", "start"]