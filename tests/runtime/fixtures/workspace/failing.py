import sys

print("failure detail", file=sys.stderr)
raise SystemExit(7)
