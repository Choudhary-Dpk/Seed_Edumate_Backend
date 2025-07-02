module.exports = {
  apps: [{
    name: 'edumate',
    script: './dist/app.js',
    instances: '1',
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3031
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3031
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};