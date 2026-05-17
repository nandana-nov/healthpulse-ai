# MetaFit AI

MetaFit AI — production-ready healthcare & fitness platform skeleton.

This repository contains a full-stack PHP + MySQL backend and a responsive frontend scaffold.

Quick start:

1. Copy `.env.example` to `.env` and update DB and payment keys.
2. Build containers:

```bash
docker compose up --build -d
```

3. Run database migrations:

```bash
mysql -u root -p < database/schema.sql
```

See `docs/DEPLOYMENT.md` for cloud deployment steps.
