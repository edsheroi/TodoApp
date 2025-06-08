import sql from 'mssql'

const config = {
    user: '######', //set your user
    password: '######', //set your password
    server: 'localhost', // set your server
    database: '######', //set your database
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
