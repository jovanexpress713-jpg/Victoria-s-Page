#!/usr/bin/env python3
import hashlib
import secrets
import sys

if len(sys.argv) != 2:
    raise SystemExit('Usage: python scripts/hash_password.py "YOUR_PASSWORD"')

password = sys.argv[1].encode('utf-8')
salt = secrets.token_bytes(16)
digest = hashlib.pbkdf2_hmac('sha256', password, salt, 310000)
print(f'pbkdf2_sha256${salt.hex()}${digest.hex()}')
