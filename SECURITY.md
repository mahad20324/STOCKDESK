# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in StockDesk, please report it responsibly. **Do not open a public GitHub issue.**

Instead, please email: **security@stockdesk.app** (or the maintainer's private email)

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** within 48 hours
- **Initial assessment:** within 1 week
- **Fix or mitigation:** critical issues within 2 weeks

## Scope

This policy covers the StockDesk application code in this repository. It does not cover:

- Third-party dependencies (report upstream)
- Infrastructure issues (Railway, Vercel — report to those platforms)
- Social engineering attacks

## Supported Versions

| Version | Supported |
|---|---|
| Latest main | Yes |
| Older releases | No |

## Best Practices for Deployment

- Never commit `.env` files
- Use strong, unique `JWT_SECRET` values
- Keep dependencies updated
- Use HTTPS in production
- Restrict CORS to your actual domains
