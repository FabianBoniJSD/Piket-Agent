FROM node:20-alpine AS base
WORKDIR /app
COPY package.json yarn.lock .yarnrc ./
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
