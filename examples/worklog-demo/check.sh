#!/bin/sh

set -eu

tests=$(cd -- "$(dirname -- "$0")" && pwd)/project/tests
passed=0
failed=0

for t in "$tests"/*.sh; do
  [ -e "$t" ] || continue
  if sh "$t"; then
    echo "PASS $t"
    passed=$((passed + 1))
  else
    echo "FAIL $t"
    failed=$((failed + 1))
  fi
done

echo "$passed passed, $failed failed"
[ "$failed" -eq 0 ]
