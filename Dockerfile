# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
# For sharp/next-image on alpine
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# ---------- Stage 2: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
# Give Node more memory just for the build
ENV NODE_OPTIONS=--max-old-space-size=3072
# Optional: reduce memory further by skipping source maps
ENV NEXT_DISABLE_SOURCEMAPS=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# If you use standalone output, make sure next.config.js has:  module.exports = { output: 'standalone' }
RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat

# If using output: 'standalone'
COPY --from=builder /app/.next/standalone ./
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 7001
# For standalone build, Next provides a server.js entrypoint at project root in the standalone folder
CMD ["node", "server.js"]
