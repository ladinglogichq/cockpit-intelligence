FROM node:22-alpine
WORKDIR /app

# Copy workspace manifests so npm can resolve @cockpit/agents
COPY package.json package-lock.json ./
COPY services/agents/package.json services/agents/
COPY services/api/package.json services/api/

# Install production dependencies (workspaces resolved via root)
RUN npm ci --omit=dev && npm cache clean --force

# Install tsx for production — agents package has noEmit:true so
# we need a TS runner for the relative import: ../../agents/src/agentDirect.js
RUN npm i -g tsx

# Copy source for both workspaces (API runtime + agents lib)
COPY services/agents/src services/agents/src
COPY services/api/src services/api/src

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["tsx", "services/api/src/index.ts"]
