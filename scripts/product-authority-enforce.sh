#!/usr/bin/env bash
# Shared Product Authority invocation. GitHub's single-line default shell is
# `bash -e` without pipefail, so `node | tee` was reporting SUCCESS after exit 1.
# pipefail keeps the gate status while tee retains the diagnostic text.
set -o pipefail
node scripts/product-authority-gate.mjs | tee product-authority-result.txt
