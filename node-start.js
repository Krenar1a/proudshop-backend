#!/usr/bin/env node
const { spawn } = require('child_process');

// Run alembic migrations first, then start uvicorn
const run = (cmd, args, opts={}) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  p.on('exit', code => code === 0 ? res() : rej(new Error(cmd+" exited "+code)));
});
(async () => {
  try {
    await run('alembic', ['upgrade', 'head']);
  } catch (e) {
    console.error('Alembic migration failed (continuing):', e.message);
  }
  const port = process.env.PORT || 10000;
  const uvicornArgs = ['app.main:app', '--host', '0.0.0.0', '--port', port];
  const p = spawn('uvicorn', uvicornArgs, { stdio: 'inherit', shell: true });
  p.on('exit', code => process.exit(code));
})();
