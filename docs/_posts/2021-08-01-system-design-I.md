---
layout: post
title:  "System Design - Online Education Platform Part 1"
date:   2021-08-01
categories: system-design
---

# System Design - Online Education Platform Part 1

*August 1st 2021*

---

## Table of Contents

1. [Introduction to the Instructors Service](#intro-to-service)
2. [Server Design](#server-design)
    * [Add CRUD support for the Instructors API with Express](#crud)

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

**Next, we will approach the database design and decide which DBMS to use.**
