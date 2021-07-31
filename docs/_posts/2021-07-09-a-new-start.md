---
layout: post
title:  "A new start"
date:   2021-07-30
categories: system-design
---

# System Design - Online Education Platform

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

I embark on a journey to build a scalable backend to a service with an existing front-end service and proxy. Our team is building an item detail page clone of Coursera. The service I am building is the Instructors service and also the proxy that serves all the services.

Follow me on this journey where I will expand the service's CRUD operations, build and compare 2 DBMS backends, deploy onto AWS. Finally, the journey's finisher involves improving the page's performance, tested against stress tests of increasing RPS. The methods of scaling include server side rendering, caching, and load balancing.

The proxy and service repos:
* [Proxy](https://github.com/rpt26-sdc-factory/vbao-proxy)
* [Instructors service](https://github.com/rpt26-sdc-factory/vbao-instructor-service)

## <a name="intro-to-service"></a>Introduction to the Instructors Service

### <a name="crud"></a>Add CRUD support for the Instructors API with Express

## <a name="server-design"></a>Server Design

## <a name="db-design"></a>Database Design

### <a name="data-gen-script"></a>Create a Data Generation Script

### <a name="compare-db"></a>Compare DBMS

### <a name="postgres"></a>Update API to use PostgreSQL

#### <a name="stress1"></a>Stress Test 1: Initial Performance

## <a name="deployment"></a>Deployment

### <a name="proxy"></a>Overview of the Proxy

### <a name="aws"></a>Overview of AWS

### <a name="deploy-service"></a>Deploy the Service and Proxy

### <a name="deploy-db"></a>Deploy the DBMS Server

#### <a name="stress2"></a>Stress Test 2: Deployed Performance

## <a name="scaling"></a>Scaling

### <a name="ssr"></a>Implement Server Side Rendering on React

#### <a name="stress3"></a>Stress Test 3: SSR Performance

### <a name="caching"></a>Implement Caching with Redis

#### <a name="stress4"></a>Stress Test 4: Caching Performance

### <a name="lb"></a>Implement Load Balancing with NGINX

#### <a name="stress5"></a>Stress Test 5: Load Balancing Performance
