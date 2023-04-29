FROM node:20.0.0-alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn,id=yarn-cache YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile
COPY . .


FROM build as vscode-development
RUN apk add -u git sudo
# The node base image already has a user and group called "node" which we can use
ARG USERNAME=node
# Add sudo support
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME
USER $USERNAME

FROM build as app
ENTRYPOINT ["node", "index.js"]
CMD ["--help"]
