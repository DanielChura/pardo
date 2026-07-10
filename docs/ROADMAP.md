# Pardo Backend Roadmap

**Pardo** es el backend de una tienda e-commerce de accesorios para perros
(juguetes, camas, ropa, correas, higiene). Sirve APIs REST para la tienda
online (catálogo, carrito, checkout Stripe, reseñas) y panel administrativo
(CRUD de productos/órdenes/usuarios, auditoría).

**Stack:** NestJS 11 + TypeScript, Prisma + PostgreSQL, Stripe, Cloudinary,
JWT + refresh tokens (HttpOnly cookies), nestjs-pino, ThrottlerModule, Docker.

**Características arquitectónicas clave:**
- **Seguridad (crítica):** OWASP Top 10 — rate limiting, Helmet, CORS restrictivo, cookies seguras, validación Joi.
- **Confiabilidad (alta):** Transacciones atómicas (`$transaction`), idempotencia de webhook, stock en tiempo real.
- **Mantenibilidad (alta):** Arquitectura NestJS modular, sin capas DDD ni CQRS — módulo por dominio.
- **Testabilidad (media):** Unit + E2E en flujos core (orden → pago → webhook).
- **Observabilidad (media):** Logs JSON estructurados, health checks.
- **Escalabilidad (baja):** < 100 órdenes/día, monolito alcanza, sin Redis/caché.

---

## Tabla de Progreso

| Stage | Descripción | Estado |
| :--- | :--- | :--- |
| **00** | Hotfixes Críticos | ✅ Completado |
| **01** | Hardening & Seguridad | ✅ Completado |
| **02** | Testing Profesional | ✅ Completado |
| **03** | Arquitectura & Pagos | ✅ Completado |
| **04** | Performance & Escalabilidad | ✅ Completado |
| **05** | DevOps & Producción | ✅ Completado |

---

