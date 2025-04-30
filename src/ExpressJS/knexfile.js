module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'ver', // <- tvoje uporabniško ime
      password: '', // <- če si nastavila geslo, napiši ga tukaj, drugače pusti prazno
      database: 'docusafe', // <- ime tvoje baze
      port: 5432, // privzeti PostgreSQL port
    },
    migrations: {
      directory: './migrations',
    },
  },
};
