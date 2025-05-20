import sql from 'mssql'

const config = {
    user: 'dev',
    password: 'asswaa025448',
    server: 'localhost',
    database: 'todolistdb',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
}


export async function connectDB() {
    try {
      const pool = await sql.connect(config)
      console.log('connect database completed')
      return pool
    } catch (err) {
      console.error('Database connection error:', err)
      throw err
    }
  }