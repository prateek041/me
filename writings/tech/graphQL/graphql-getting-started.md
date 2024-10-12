---
title: 'GraphQL getting started'
date: 'February 28, 2023'
description: 'Understand the basics of GraphQL, and how is it comparable to RESTful APIs'
---

So, you have been developing RESTful services, where you define routes, that return data you might not even need. The age-old "Underfetching" and "Overfetching" problems.

Numerous resources can help you realize why GraphQL can make your work hard, but eventually easier. This article is about helping you learn how to use it in your project. All you need to know is that commonly when using REST APIs, there are different routes related to different entities, i.e. if you want to do something related to the user, you will POST/GET/UPDATE ... to the /user route and similarly, you will use /posts for interacting with Posts related information.

But, in the case of GraphQL, you can do all the things with just one route, where you send a request defining what you want to do and the server will do exactly what was asked. Check this small intro:

[GraphQL Explained in 100 Seconds](https://www.youtube.com/watch?v=eIQh02xuVw4)

## What is GraphQL

Above we understood the overall concept, now we will be understanding how a developer can use GraphQL in their project. Here is what you have to understand, it might not be the true definition but, GraphQL is a way of defining

1. What your server can do (using the schema)
2. Telling it how to do it (using resolvers)

## Defining what your server can do (Schema)

Let's consider this schema example first

```graphql
# User type, used to store private information like email, password etc.
type User {
  id: ID
  name: String
  email: String
  password: String
  profileID: String
}

# A user profile, which has two three attributes, id, name and email.
type Profile {
  id: ID
  name: String
  email: String
}

# Queries: telling what a client can "query" from your server
type Query {
  getAllUsersProfile: [Profile!]!
  getUserProfile(email: String): Profile
}

# Mutations: telling what "changes" the user can do to your server
type Mutation {
  newUserSignUp(name: String, email: String, password: String): String
  userLogin(email: String, password: String): String
}
```

yes, this is huge. but let me point out the obvious things. Here, we have a **User** type, a **Profile** type, a **Query** type and a **Mutation** type.

> Note: These types might look like JavaScript objects, but it is not JavaScript, instead it is the GraphQL DSL (Domain specific language), which is made specifically to make the task of writing schema easier. Here each attribute is like an entry/property of that type.

let's start with the *special* ones, the Query type and Mutation type. These are special ones because these are reserved words, that have special functionality. Just like programming languages have Keywords.

* **Query Type:**

This type tells what you can *query* from the server i.e. what you can get from the server. As the name of the first field **getAllUsersProfile** suggests, it returns all user profiles that exist. How? (we use resolvers for that) we don't need to care about that right now because we are in the "what your server can do ?" part. Now let's try to understand the code.

```graphql
type Query {
  getAllUsersProfile: [Profile!]!
  getUserProfile(email: String): Profile
}
```

The code says *"when you run getAllUsersProfile, you will get an array of Profiles"*. And similarly, **getUserProfile(email: String): Profile** says *"If you run getUserProfile and pass an argument of String type, you will get a profile back". Here is how it looks:*

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677591450941/1135ae0a-42d9-4b21-9d59-543632a4c608.png)

What you see right now is a "GraphQL playground", where you can test your API by sending it requests. On the left we have the request, on the right side, we have the response, generated from the server. We are passing the email into the *argument* of the request so that the server can identify the user we want to see the profile of. There are a lot of special things going on here, but we will have to wait for them.

Similarly, we have another query, getAllUsersProfile, that looks like this

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677591843735/fcc4f3f1-2dd8-472b-a7b4-da2869876a96.png)

We did not pass any argument here because we don't want any unique user here, we want to see all the users in our database, and that is what we get. See how getAllUsersProfile contains an array of objects? just like we described in the schema above.

Ok, so we use query type to define what we can search from the server. But, we don't always just search, for things like creating a new user, a new post or editing the user profile, we need to *change* something in our database. That is what *mutations* are for.

* **Mutation Type:**

In our schema, we have two mutations, namely **newUserSignUp** and **userLogin**.

```graphql
# Mutations: telling what "changes" the user can do to your server
type Mutation {
  newUserSignUp(name: String, email: String, password: String): String
  userLogin(email: String, password: String): String
}
```

What information do we need when we create a new user? name, email and password for example? so we pass them in as arguments. The code says *"If you run newUserSignUp, with arguments name, email and password as string type, the server will return a string"* and before returning that string, the server will create a new user entry in the database. It will look something like this:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677594076685/fb1d515c-44fa-4831-955a-63917fcb8d33.png)

One is called Query and another Mutation because, Query is not changing anything on the backend or the database, it is just returning what is already there, but mutation (as the name suggests), is making changes in the backend.

There is one more special type, **Subscription**, which is pretty simple, we can use it to constantly watch for changes, let's say we have a post, whose number of views and likes are constantly changing. Instead of requesting the new data again and again, a subscription can be used, which will return the new data as soon as any changes happen.

These were the special types in GraphQL, now coming to other types like User, Profile etc. that we defined in our above schema.

* **Object Type:**

These are the most basic types in GraphQL, they are used to define (as the name suggests) objects. Objects that you can interact with using Query, Mutation and Subscription types. Here is an example:

```graphql
# A user profile, which has two three attributes, id, name and email.
type Profile {
  id: ID
  name: String
  email: String
}
```

This is a profile type, which has three fields, id of type ID, name of type String and email of type String. It means every Object of the Profile type will have three attributes, id, name and email.

So, in the queries above, we saw that getAllUserProfiles was returning an array of Profile types, which means each entry in that array will have an id, a name and an email. here, we can see that:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677596510618/21150b65-711f-4f58-b648-c3eb5d6941ee.png)

We use these object types to define what different entities in our server look like, so that we can use that information to define what our server returns when requested for something.

These are the most basic things I learned while learning GraphQL, there is more to schemas, types, mutations etc. but I think a person should look for things only when they need them.

Now, coming up to the next big question. *"Ok, you defined the schema using GraphQL, which tells the functionalities of our server, but how is it happening ? what is the magic going on ?".* We saw that the getAllUsersProfile query is returning an array of Profiles, but how? We use ***resolvers*** for that.

## Telling it how to do it (Resolvers)

For every field in the schema, that is not returning a scalar i.e. not returning anything like int, float, string, boolean or ID, there exists a resolver.

A resolver is a function that does the task of doing what that specific field does, for example, getAllUsersProfile returns an array of Profile types right? so, there is a resolver for getAllUsersProfile, that will do some work and eventually return an array of Profile types. Here is what a resolver looks like

```javascript
// return an array of user profiles
const getAllUsersProfile = async (_, args, context) => {
  const userList = await ProfilesCollection.find()
  return userList;
}
```

We are using MongoDB as our database, from where we are fetching the data, but that is not part of this blog. All you need to understand is that there is a function named getAllUsersProfile, that is taking a few arguments (these arguments are important and will be explained later) and eventually returns the data it fetched from the database. Our database looks like this, which is exactly how our Profile type looks:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677599345053/d0a51db4-117c-4fdc-99e5-eb628a44663d.png)

Therefore the entire query looks like this

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1677599488948/524d9a71-14d1-47f1-8280-4fb6d489a7e8.png)

Just like above, we define a resolver for every field inside Mutations and Query objects. This can be nested as well, but that is a more advanced part, we will be going through things step by step. For example, check another resolver here:

```javascript
// return the user profile associated to the provided email
const getUserProfile = async (_, args) => {
  const user = await ProfilesCollection.findOne({ email: args.email })
  return user;
}
```

Now, let's see a bit more about what the arguments to the resolver function mean and what they do.

We can pass 4 arguments to a resolver function, **Parent, args, context** and **info**, the official GraphQL docs explain it pretty well.

[Arguments in GraphQL resolvers](https://graphql.org/learn/execution/#root-fields-resolvers)

Once, we define both, the schema and the resolvers, all we need to do is connect them, i.e. tell the server (We have used Yoga, but they are all very similar), what resolver to call for what field. We can do it with something like this

```javascript
const { newUserSignUp, userLogin } = require("../resolvers/user")
const { getAllUsersProfile, getUserProfile } = require("../resolvers/profile")

const resolvers = {
  Query: {
    getAllUsersProfile: getAllUsersProfile,
    getUserProfile: getUserProfile
  },
  Mutation: {
    newUserSignUp: newUserSignUp,
    userLogin: userLogin
  }
}

module.exports = {
  resolvers
}
```

getAllUsersProfile on the left is the field and the one on the right is the actual resolver function to be called. Now we combine the ***schema*** and the ***resolvers*** and pass it to a GraphQL server implementation. I am providing the example using **GraphQL Yoga**, but all of the server implementations for GraphQL are the same since the concept remains the same.

This blog series is what I am using to document my journey of me, building a Full stack application, where I have started with the backend. In the next few articles I will be covering how to build a GraphQL server using MongoDB, Yoga, Node and many tools, so stay tuned to learn more!

[My Application: Top-Crew](https://github.com/prateek041/Top-crew)
