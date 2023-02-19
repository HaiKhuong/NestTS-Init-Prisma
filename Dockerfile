FROM node:16-alpine

COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

COPY . .
RUN mv .env.build .env
RUN rm -rf .env.*

# RUN npm install -g prisma
# RUN npm install -g @prisma/client

RUN npx prisma generate

RUN npm run build

CMD npx prisma db push --accept-data-loss && npm run start