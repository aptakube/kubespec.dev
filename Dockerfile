FROM node:lts-alpine

## args
ARG GITLAB_USERNAME
ARG GITLAB_TOKEN

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run download

RUN npm run build

ENV PORT=4321
EXPOSE 4321
CMD ["npm", "run", "start"]