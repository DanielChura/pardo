#!/bin/sh

pnpm prisma migrate deploy

node dist/src/main.js