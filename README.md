## **WORKING**

* The application works as per the provided guidelines.
* The payment page simulates the transaction process, so you may encounter an "Order Not Found" page. To approve the transaction, try processing it again.
* All data is stored in a PostgreSQL database, so make sure you have your ***database connection*** string ready from services like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Aiven](https://aiven.io).
* Get you email credential from [Mailtrap.io](https://mailtrap.io)

## **SETUP**

There are two methods you can use to set up the application:

### 1. Manual Setup

* Install Node packages:

  ```
  npm install --legacy-peer-deps
  ```

**A. PostgreSQL SETUP**

* Download PostgreSQL from the following link: [Download PostgreSQL](https://www.postgresql.org/download/windows/)

**OR**

* If Docker is installed, start **PostgreSQL** using a Docker file:

  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
  JWT_SECRET="your_jwt_secret"
  PORT=5000
  ```

**OR**

* **Using Cloud PostgreSQL:** Use services like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Aiven](https://aiven.io) to get a connection URL.

* Set up a **.env** file in the root directory and add the following:

  ```
  # from Mailtrap.io take Username and token for password
  HOST=live.smtp.mailtrap.io 
  USERNAME=info@stackdev.shop # or smtp@mailtrap.io 
  PASSWORD=wpgbychjarekqxqc
  # If using a local setup
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
  # If using a cloud setup
  DATABASE_URL=<cloud_database_url>
  ```

* Migrate the database and seed data for product viewing:

  ```
  npm run db:migrate
  ```

* Once the database migration and seeding are successful, start the application:

  ```
  npm run dev
  ```

---

### 2. Using Docker Compose

* If your system has Docker installed, run the following commands:

  ```
  docker compose build
  docker compose run app npm run db:migrate
  docker compose up
  ```