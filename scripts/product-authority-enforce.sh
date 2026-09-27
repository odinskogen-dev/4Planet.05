#!/usr/bin/env bash
# Shared Product Authority invocation. GitHub's single-line default shell is
# `bash -e` without pipefail, so `node | tee` was reporting SUCCESS after exit 1.
# pipefail keeps the gate status. The gate writes FAIL on stderr, so both
# streams are retained in the tee file and in the workflow log.
set -o pipefail
node scripts/product-authority-gate.mjs 2>&1 | tee product-authority-result.txt
