# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Crucial for your @prisma/client dependency)
RUN npx prisma generate

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID

ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET


RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]