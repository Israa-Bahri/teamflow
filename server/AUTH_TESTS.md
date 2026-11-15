# Auth tests

| Test | Expected | Result |
|---|---|---|
| Duplicate email | 409 | PASS |
| Password too short | 400 | PASS |
| Wrong password | 401 | PASS |
| Unknown email | 401 | PASS |
| Missing token | 401 | PASS |
| Fake token | 401 | PASS |
| Expired token | 401 | PASS |

Run with: `node testAuthErrors.js` (server must be running).