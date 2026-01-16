FROM node:24-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY src/ ./src/

# Run as non-root user
USER node

CMD ["node", "--require", "dotenv/config", "src/index.js"]
