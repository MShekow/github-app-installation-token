FROM node:19.9.0-bullseye AS dependencies

WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn,id=yarn-cache YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile
COPY . .

#FROM dependencies AS build
#RUN npm run build


FROM dependencies as vscode-development
RUN apt-get update && apt-get install -y git sudo
# The node base image already has a user and group called "node" which we can use
ARG USERNAME=node
# Add sudo support
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME
USER $USERNAME

######################################
#FROM nginxinc/nginx-unprivileged:1.23.1-alpine AS production
#COPY --from=build --chown=nginx /app/dist /usr/share/nginx/html
