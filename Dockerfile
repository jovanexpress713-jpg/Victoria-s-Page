# ============================================================
# Victoria Line Soft — صورة إنتاج متعددة المراحل
# البناء:  docker build -t victoria-line-soft .
# التشغيل: docker run -p 8080:80 victoria-line-soft
# متغيرات البناء (اختيارية): VITE_SITE_URL, VITE_WHATSAPP_NUMBER,
#                            VITE_ADMIN_PASSWORD_HASH, VITE_ADMIN_SESSION_MINUTES
# ============================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SITE_URL=
ARG VITE_WHATSAPP_NUMBER=
ARG VITE_APP_NAME=
ARG VITE_ADMIN_PASSWORD_HASH=
ARG VITE_ADMIN_SESSION_MINUTES=
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_ADMIN_PASSWORD_HASH=$VITE_ADMIN_PASSWORD_HASH \
    VITE_ADMIN_SESSION_MINUTES=$VITE_ADMIN_SESSION_MINUTES

RUN npm run build

# ------------------------------------------------------------
FROM nginx:1.27-alpine AS serve

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/vls-security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
