---
layout: post
title:  "A new start"
date:   2021-07-30
categories: system-design
---

# System Design - Online Education Platform Part 1

*July 30th 2021*

---

## Table of Contents

1. [Introduction to the Instructors Service](#intro-to-service)
2. [Server Design](#server-design)
    * [Add CRUD support for the Instructors API with Express](#crud)
3. [Database Design](#db-design)
    * [Create a Data Generation Script](#data-gen-script)
    * [Compare DBMS](#compare-db)
    * [Update API to use PostgreSQL](#postgres)
      * [Stress Test 1: Initial Performance](#stress1)
4. [Deployment](#deployment)
    * [Overview of the Proxy](#proxy)
    * [Overview of AWS](#aws)
    * [Deploy the Service and Proxy](#deploy-service)
    * [Deploy the DBMS Server](#deploy-db)
      * [Stress Test 2: Deployed Performance](#stress2)
5. [Scaling]()
    * [Implement Server Side Rendering on React](#ssr)
      * [Stress Test 3: SSR Performance](#stress3)
    * [Implement Caching with Redis](#caching)
      * [Stress Test 4: Caching Performance](#stress4)
    * [Implement Load Balancing with NGINX](#lb)
      * [Stress Test 5: Load Balancing Performance](#stress5)

---

I embark on a journey to build a scalable backend to a service with an existing front-end service and proxy. Our team is building an item detail page clone of [Coursera's](https://www.coursera.org/). The service I am building is the Instructors service and also the proxy that serves all the services.

Follow me on this journey where I will expand the service's CRUD operations, build and compare 2 DBMS backends, deploy onto AWS. Finally, the journey's finisher involves improving the page's performance, tested against stress tests of increasing RPS. The methods of scaling include server side rendering, caching, and load balancing.

The proxy and service repos:
* [Proxy](https://github.com/rpt26-sdc-factory/vbao-proxy)
* [Instructors service](https://github.com/rpt26-sdc-factory/vbao-instructor-service)

## <a name="intro-to-service"></a>Introduction to the App

The app we are building is a clone of [Coursera's](https://www.coursera.org/) item detail page (course detail page in this case, [exmaple](https://www.coursera.org/learn/machine-learning)). This page has 2 primary parts. A proxy and the page's services.

![Proxy Screenshot](https://vbao-readme-screenshots.s3.us-west-1.amazonaws.com/sdc_proxy_screenshot.png)

**What is a service?** A service is a standalone API that serves its own front-end and has its own back-end data. This allows for larger web pages to be able to display data even if one of the services are down. For example, let's pretend Amazon's item detail page contained an images service, price service, and reviews service. If the reviews service's database was down for maintenence, the Amazon item detail page would still be able to show users prices and images. Only the reviews would be gone (which can easilty be replace with a placeholder in case the database or server fails).

As a result, the use of services makes more complex apps more flexible for both developers to work on serparately, as well as better for user experience in case other services fail.

**What is a proxy?** The proxy serves static assets and does not rely on any database directly. Its main purpose is to present the combined assets of all its services on the page.

The services the team worked on split into a title banner service, syllabi service, about service, instructors service, image service, and reviews service. This series of blogs will focus on the instructors service and proxy.

The services in this Coursera clone are determined arbitrarily. The important note is that each service has its own database and API. Services may request data from other services within the same page, so we also have to keep in mind to write an API that is usable by other services.

### The Instructors Service

The instructor's service contains 3 parts. As I have inherited a codebase that has a completed front-end the first thing to do is to explore the existing codebase.

Referencing this [Coursera page](https://www.coursera.org/learn/machine-learning) the "Instructor" section is what the front-end team determined to be the instructor service. It contains an "Instructor" header that contains instructor details, "Offered By" with some information about the establishment that offers the course, and "Testimonials" that contains student testimonials.

Unfortunately, the front-end team did not yet implement the "Offered By" and "Testimonials" sections. So we will work from the "Instructor" section.

**Folder structure:**

```bash
root
|
|_client
| |_components
| | |_instructors
| |   |_(front-end components).jsx
| |
| |_index.js
| |_styles.css
|
|_db
| |_data
| | |_instructors.json
| |
| |_generators
| | |_instructorsGenerator.js
| |
| |_inserters
| | |_instructorsInserter.js
| |
| |_schemas
| | |_instructorsSchema.js
| |
| |_index.js
| |_models.js
|
|_public
| |_bundle.js
| |_index.html
|
|_server
  |_index.js
```

As seen in the folder structure there are 4 primary folders.

* `client` contains the front-end components created with React.
* `public` contains the main `index.html` file and a `bundle.js` file that is transpiled from the React components.
* `db` contains database related scripts: database schema, dummy data generation, data insertion, database initialization.
* `server` contains API endpoints and server connection initialization. Currently, only `GET` request has a route.

## <a name="server-design"></a>Server Design

### <a name="crud"></a>Add CRUD support for the Instructors API with Express

To begin with, I expanded the possible routes for CRUD support. Currently, the API only handles `GET` requests.

To make the code more modular I added a new file named `controllers.js`. `controllers.js` contains the functions that will connect to the database and handle each type of CRUD request. Below is an example of how the functions were used.

```javascript
/** controllers.js */
module.exports = {
  createInstructors,
  getInstructors,
  getPrimaryInstructor,
  setInstructor,
  deleteInstructor,
};

/** index.js */
app.post('/api/instructors', createInstructors);
app.get('/api/instructors/:courseNumber', getInstructors);
app.get('/api/primaryinstructor/:courseNumber', getPrimaryInstructor);
app.put('/api/instructors/:instructorid', setInstructor);
app.delete('/api/instructors/:instructorid', deleteInstructor);
```

At the moment, the database used is still MongoDB, and we will be implementing a different database later on, so I won't go in-depth about what each function does just yet. But an overview:

* `createInstructors` will insert a new instructor into the database.
* `getInstructors` requires a course number, and will get all instructors for that particular course.
* `getPrimaryInstructor` requires a course number, and will return the primary instructor of that course.
* `setInstructor` will update instructor details based on instructor ID.
* `deleteInstructor` will delete the instructor and remove them from the courses they teach.

While the endpoints were functional with the inherited MongoDB, the primary purpose of handling the CRUD requests first is structural and gives us a guide as to what kind of DB queries we may need.

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

The data from JSON file was inserted perfectly, but I still had to write a bash script that imported the JSON files one at a time. Insertion of 10 million records took in total 8.57 minutes in real time. The database is now 0.955GB.

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

Using the same JSON file generated in the previous steps, seeding Cassandra took a total of 48 minutes and 43 seconds to seed. This is signifcantly longer than insertion into MongoDB.

#### PostgreSQL

### <a name="postgres"></a>Update API to use PostgreSQL

#### <a name="stress1"></a>Stress Test 1: Initial Performance

## <a name="deployment"></a>Deployment

### <a name="proxy"></a>Overview of the Proxy

### <a name="aws"></a>Overview of AWS

### <a name="deploy-service"></a>Deploy the Service and Proxy

### <a name="deploy-db"></a>Deploy the DBMS Server

#### <a name="stress2"></a>Stress Test 2: Deployed Performance

## <a name="scaling"></a>Scaling

![Network Architecture](https://vbao-readme-screenshots.s3.us-west-1.amazonaws.com/sdc_network_architecture.png)

### <a name="ssr"></a>Implement Server Side Rendering on React

#### <a name="stress3"></a>Stress Test 3: SSR Performance

### <a name="caching"></a>Implement Caching with Redis

#### <a name="stress4"></a>Stress Test 4: Caching Performance

### <a name="lb"></a>Implement Load Balancing with NGINX

#### <a name="stress5"></a>Stress Test 5: Load Balancing Performance
