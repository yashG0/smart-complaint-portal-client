#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:5500}"
FRONTEND_BASE="${FRONTEND_BASE:-}"

echo "Smart Complaint Portal Demo Helper"
echo "=================================="
echo ""
echo "Backend URL : ${BACKEND_URL}"
echo "Frontend URL: ${FRONTEND_URL}${FRONTEND_BASE}"
echo ""

echo "[1/2] Checking backend health..."
if command -v curl >/dev/null 2>&1; then
  if curl -fsS "${BACKEND_URL}/api/health" >/dev/null; then
    echo "  OK: backend is reachable"
  else
    echo "  WARN: backend health check failed (${BACKEND_URL}/api/health)"
  fi
else
  echo "  WARN: curl not installed; skipping health check"
fi

echo ""
echo "[2/2] Demo URLs"
echo "  Landing      : ${FRONTEND_URL}${FRONTEND_BASE}/index.html"
echo "  Student Login: ${FRONTEND_URL}${FRONTEND_BASE}/pages/user/login.html"
echo "  Dept Login   : ${FRONTEND_URL}${FRONTEND_BASE}/pages/department/login.html"
echo "  Admin Login  : ${FRONTEND_URL}${FRONTEND_BASE}/pages/admin/login.html"
echo ""
echo "Recommended Demo Flow"
echo "  1) Student: login -> create complaint -> view complaint history."
echo "  2) Admin: assignment queue -> assign complaint to a department."
echo "  3) Department: assigned page -> update status (in_progress/resolved)."
echo "  4) Admin: all complaints -> verify status + timeline history."
echo ""
echo "Tip: If frontend is served from project root, set:"
echo "  FRONTEND_BASE=/frontend bash scripts/demo.sh"
