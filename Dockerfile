FROM node:8-alpine
MAINTAINER Michael Eden <themichaeleden@gmail.com>

# Deis wants bash
RUN apk update && apk add bash
RUN apk add git
# Install latest npm version (in case Node.js hasn't updated with the newest version yet)
# npm install -g npm@latest doesn't work -> see https://github.com/npm/npm/issues/15611#issuecomment-289133810 for this hack
RUN npm install npm@"~5.3.0" && rm -rf /usr/local/lib/node_modules && mv node_modules /usr/local/lib

# Bundle app source
WORKDIR /usr/src/auth
COPY . /usr/src/auth
RUN npm install
RUN npm run build

# Set Timezone to EST
RUN apk add tzdata
ENV TZ="/usr/share/zoneinfo/America/New_York"

# Deis wants EXPOSE and CMD
EXPOSE 3000
CMD ["npm", "start"]
