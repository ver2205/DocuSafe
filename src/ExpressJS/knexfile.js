module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'ver',
      password: '',
      database: 'docusafe',
      port: 5432,
    },
    migrations: {
      directory: './migrations',
    },
  },
};
