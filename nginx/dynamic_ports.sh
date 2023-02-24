#!/bin/bash

# After using envsubst, it will yield the build-in nginx variables. Exporting DOLLAR="$" solves the problem.
export DOLLAR="$"
envsubst < /etc/nginx/conf.d/app.conf > /etc/nginx/conf.d/default.conf  
unset DOLLAR 
rm -f /etc/nginx/conf.d/app.conf
nginx -g "daemon off;"