install:
	pnpm install

dev-api:
	PORT=8080 pnpm --filter @workspace/api-server run dev

dev-web:
	pnpm --filter @workspace/sahu-csc run dev

build:
	pnpm --filter @workspace/sahu-csc run build && \
	pnpm --filter @workspace/api-server run build

typecheck:
	pnpm run typecheck:libs

push:
	git add . && git commit -m "$(msg)" && git push origin main

status:
	git status && git log --oneline -5
