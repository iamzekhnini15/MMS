#!/bin/sh
# Usage: wait-for host:port -t timeout
set -e

hostport=$1
timeout=${2:-30}

host=$(echo $hostport | cut -d: -f1)
port=$(echo $hostport | cut -d: -f2)

echo "Waiting for $host:$port (timeout=$timeout seconds)..."

while ! nc -z "$host" "$port"; do
  timeout=$((timeout - 1))
  if [ "$timeout" -le 0 ]; then
    echo "Timeout waiting for $host:$port"
    exit 1
  fi
  sleep 1
done

echo "$host:$port is available"
