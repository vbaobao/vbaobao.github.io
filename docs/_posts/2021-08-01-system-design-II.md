---
layout: post
title:  "System Design - Online Education Platform Part 2"
date:   2021-08-01
categories: system-design
---

# System Design - Online Education Platform Part 2

*August 1st 2021*

---

## Table of Contents

1. [Database Design](#db-design)
    * [Create a Data Generation Script](#data-gen-script)
    * [Compare DBMS](#compare-db)
    * [Update API to use PostgreSQL](#postgres)

---

## <a name="db-design"></a>Database Design

The inherited instructors schema is formatted following MongoDB documentation.

```javascript
const instructorsSchema = new Schema({
  id: Number,
  firstName: String,
  middleInitial: String,
  lastName: String,
  academicTitle: String,
  title: String,
  organization: String,
  learners: Number,
  courses: [{
    courseNumber: Number,
    isPrimaryInstructor: Boolean,
  }],
  instructorAverageRating: String,
  numberOfRatings: Number,
});
```

One of the goals of this project is to compare the performance of multiple databases. As it was inherited with MongoDB I was tasked to choose 2 other DBMS to compare, one SQL and one noSQL. The fated DBMS were PostgreSQL (relational DB) and Cassandra (noSQL).

The goal is to compare data insertion and query efficiency for a database with 10 million primary records.

### <a name="data-gen-script"></a>Create a Data Generation Script

To prepare for comparing the rate of data insertion for each database I decided to create a reusable data generation and insertion script. Due to the immense amount of data the data generation and insertion will have to be done asynchronously, or else the Javascript compiler will error out when it hits max heap allocation. The solution is not to increase memory allocation but to run the function asynchronously.

### <a name="compare-db"></a>Compare DBMS

#### MongoDB

The default generation script uses the [Faker](https://www.npmjs.com/package/faker) npm package to generate fake data, then write the generated data into a `.json` file. This is prior to any data insertion.

**Records Generated**

| 100   | 1k    | 10k   | 100k  | 1mil         | 10mil        |
|-------|-------|-------|-------|--------------|--------------|
| 1.91s | 3.42s | 2.64s | 7.73s | hit max heap | hit max heap |

As you can see, max heap was hit pretty early. By removing the writing to file we were able to at least generate 1 million records.

**Records Generated**

| 100   | 1k    | 10k   | 100k  | 1mil   | 10mil        |
|-------|-------|-------|-------|--------|--------------|
| 2.11s | 0.76s | 1.07s | 4.49s | 35.62s | hit max heap |

If we insert the data into a Mongo database by connecting to the database using [Mongoose](https://www.npmjs.com/package/mongoose) as is, unsurprisingly max heap is still hit and even earlier. This is using the `insertMany()` option with inserting in batches of 100, 1000, and 10000 records.

**Records Inserted**

| 100   | 1k    | 10k   | 100k     | 1mil         | 10mil        |
|-------|-------|-------|----------|--------------|--------------|
| 2.88s | 2.39s | 9.47s | 1m 19.3s | hit max heap | hit max heap |

> **Pitfalls**
>
> * JSON files are much bigger than CSV files, so data generation could have been much faster and space efficient.
> * fs.writeFile() is also not as efficient as creating a write stream with `fs.createWriteStream` when writing in batches. Write streams will queue the data to be inserted, and will not write the next one until the write is done.
> Since this project uses sequential IDs, I had to overwrite Mongo's default hashed IDs. Generating these IDs in order also proved a challenge when working with batches.
>
> Major changes will be made later on in the project to address these pitfalls.

To work around hitting maximum heap allocation in data generation I wrote a bash script that wrote data into multiple sequential JSON files asynchronously. This allowed for data to be written faster than continually adding to a single JSON file. The final result is 10 files containing 1 million records each.

To work around hitting max heap during data insertion I found a way to insert massive amounts of data in bulk using `mongoimport` ([reference](https://docs.mongodb.com/manual/reference/program/mongoimport/)). This is built into Mongo.

`time mongoimport --db=coursera --collection=instructors --type=json --file instructors_1.json --mode=insert --jsonArray`

* Note: `time` allows the terminal to track time taken to run a file.

The data from JSON file was inserted perfectly, but I still had to write a bash script that imported the JSON files one at a time. Insertion of 10 million records took in total 5 minutes 26 seconds in real time. The database is now 0.955GB.

#### Cassandra

Like MongoDB, Cassandra is a noSQL DBMS known for scalability. As it is a noSQL DBMS, it is recommended the documentation regarding how Cassandra DB and tables work most efficiently should be reviewed. Especially on topics such as how primary keys, indexes, and queries work. Unlike typical relational DBMS, Cassandra queries can only query values that are "keys". Keys refer to primary key, clustering columns, and compound primary keys. Primary keys are partition keys, representing the locality of data and uses a hash value to make querying fast. Clustering columns can be thought of as secondary keys. Compound primary keys use 2 or more columns as the primary key.

**Pros**

* scalability
* fast querying via hash functions
* can store a large amount of records nd expects data to be duplicated

**Cons**

* to be most efficient, partitions should be almost even sizes
* must limit the number of partitions read by a query for optimal results
* more structural planning required to the schema due to the above requests
* cannot use JOINS in queries
* handling duplicate data make the database take up more disk space, thus it would not work well with deployments into very small instances.

While the use of hashes make querying very fast; unfortunately, one of the setbacks is that it can take up more space than our deployment instance can offer (AWS EC2 T2micro). So it is already not very likely for me to choose this DBMS if not necessary.

I had to install [dsbulk](https://docs.datastax.com/en/dsbulk/doc/dsbulk/reference/dsbulkCmd.html). It is a Cassandra tool that can insert data in bulk in the form of JSON files. Similar to MongoImport, I wrote a shell script that imports the entire folder of dummy data.

Using the same JSON file generated in the previous steps, seeding Cassandra took a total of 14 minutes and 10 seconds to seed. This is twice as long as insertion into MongoDB.

#### PostgreSQL

Postgres did not have a solution to insert JSON files due to issues with the shape of the data containing nested objects. As a result, I redid the Postgres schema to split into 3 tables. One positive is that the endpoint to query for primary instructor alone will be much more efficient. The con is that data insertion will be slightly more complicated and will involve sequential inserts into multiple tables.

![Database schema](https://vbao-readme-screenshots.s3.us-west-1.amazonaws.com/sdc_postgresql_schema.png)

```sql
CREATE SCHEMA IF NOT EXISTS coursera;

CREATE TABLE IF NOT EXISTS coursera.instructor_details(
  instructor_id SERIAL PRIMARY KEY,
  firstname text NOT NULL,
  middleinitial text,
  lastname text NOT NULL,
  academic_title text,
  title text,
  organization text,
  learners int,
  instructor_avg_rating text,
  num_ratings int
);

CREATE TABLE IF NOT EXISTS coursera.assistant_instructors(
  assistant_id SERIAL PRIMARY KEY,
  course_id int,
  instructor_id int
);

CREATE TABLE IF NOT EXISTS coursera.primary_instructors(
  course_id int PRIMARY KEY NOT NULL,
  instructor_id int
);
```

To make my life even easier, the generation script was modified to generate a CSV file using write streams. I no longer needed a folder to store 10 JSON files. Due to the smaller size of CSV file type I could store more than 10 million rows in a single file. Write stream also improved the write process as the stream can stay open for writing instead of writing to file per insertion.

The data was inserted using `psql`'s `COPY` command.

Writing to the 3 tables total took 5 minutes and 30 seconds. This is comparable to Mongo bulk data insertion.

In order to vastly improve the query speeds in Postgres we must apply indexing and contraints to the columns and tables that are to be queried. This process is done **AFTER** the bulk data insertion. The reason is due to the nature of inserting data into Postgres. If the tables already have indexing prior to data insertion, each record inserted afterward will need to apply the indexes individually. This effect is multiplied when foreign keys and contraints are added.

```sql
ALTER TABLE coursera.assistant_instructors ADD FOREIGN KEY (instructor_id) REFERENCES coursera.instructor_details ON DELETE CASCADE;

ALTER TABLE coursera.primary_instructors ADD FOREIGN KEY (instructor_id) REFERENCES coursera.instructor_details ON DELETE CASCADE;

CREATE INDEX index_assistant_instructors_course_id ON coursera.assistant_instructors(course_id);

CREATE INDEX index_assistant_instructors_instructor_id ON coursera.assistant_instructors(instructor_id);

CREATE INDEX index_primary_instructors_instructor_id ON coursera.primary_instructors(instructor_id);
```

#### Benchmarking and Comparing Query Speeds

CRUD   | Cassandra | Postgres
-------|-----------|---------
CREATE | 1.23ms    | 27.97ms
READ   | 17.04ms   | 2.25ms
UPDATE | 0.15ms    | 0.93ms
DELETE | 0.32ms    | 1.46ms

This data show the incredible speeds of Cassandra, with the exception of reading data. While Postgres is still comparably fast, but data insertion takes much more time. This is likely due to the single query inserting into 3 tables at a time.

The final choice for DBMS was Postgres.

The simple reason was because the Cassandra partitions were not created well enough to support more complex querying. The first step in creating the Cassandra partitions should have been to build the partitions around the queries I intended to make. As a result, the partition we worked with only allowed querying of instructor IDs. The way it is currently structured it cannot do the reverse query of finding instructor IDs based on course IDs. This also explains why the CRUD requests are very fast, but it does not query the data we need.

Due to time contraints we could not completely restructure the Cassandra database from scratch again. Additionally, Cassandra would quire a larger AWS instance which meant more money would be invested into the deployment. Thus we move on with Postgres.

### <a name="postgres"></a>Update API to use PostgreSQL

The main files that needed to be updated are the controller functions within `server/controller.js`. We simply need to convert these from using a Mongo client to a [Postgres client](https://www.npmjs.com/package/pg).

The package linked for Postgres allows for connection pooling, which allows connections to be cached and reused.

Here is a simplified snippet of the `controllers.js` file:

```javascript
const client = require('../db/postgres/database.js');

const getPrimaryInstructor = async (req, res) => {
  const pool = await client.connect();
  const courseId = parseInt(req.params.courseNumber, 10);
  const sql = {
    text: `SELECT * FROM ${schema}.instructor_details WHERE instructor_id IN (SELECT instructor_id FROM ${schema}.primary_instructors WHERE course_id=$1::int)`,
    values: [courseId],
  };
  try {
    const response = await pool.query(sql);
    if (response.rows.length === 0) throw new Error('No primary instructor with the course number.');
    return res.send(response.rows);
  } catch (err) {
    return res.status(400).send(err.message);
  } finally {
    pool.release();
  }
};

module.exports = {
  getPrimaryInstructor,
};
```

I tend to separate the database client from the controller and store the file into the database folder (e.g. `~/db/postgres/database.js`). This allows me to use the client in case other files need to use it in future iterations.

```javascript
const { Pool } = require('pg');

const client = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

module.exports = client;
```

**Now we are ready to deploy and make improvements to the app performance.**
