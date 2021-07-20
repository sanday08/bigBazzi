//This file use to learn agrregation in mongo db

const { db } = require("../models/Course");

db.purchase_order.insertMany([
  { product: "toothbrush", total: 4.75, customer: "Mike" },
  { product: "guitar", total: 199.99, customer: "Tom" },
  { product: "milk", total: 11.33, customer: "Mike" },
  { product: "Pizza", total: 8.5, customer: "Karen" },
  { product: "toothbrush", total: 4.75, customer: "Karen" },
  { product: "toothbrush", total: 4.75, customer: "Dave" },
  { product: "toothbrush", total: 4.75, customer: "Mike" },
]);

//Find out how many toothbrush is sold
db.purchase_order.count({ product: "toothbrush" });
//output => 4

//Find a list of all product sold
db.purchase_order.distinct("product");
//output => [ "Pizza", "guitar", "milk", "toothbrush" ]

//Find a total amount of money spent by each customer
db.purchase_order.aggregate([
  { $match: {} },
  { $group: { _id: "$customer", total: { $sum: "$total" } } },
]);
//output(In this query parameter must be required with $ sign)
// { "_id" : "Dave", "total" : 4.75 }
// { "_id" : "Mike", "total" : 20.83 }
// { "_id" : "Tom", "total" : 199.99 }
// { "_id" : "Karen", "total" : 13.25 }

//Find a total amount of money spent by each customer and sort by total amount asc
db.purchase_order.aggregate([
  { $match: {} },
  { $group: { _id: "$customer", total: { $sum: "$total" } } },
  { $sort: { total: 1 } },
]);
//output(In this query parameter must be required with $ sign)
// { "_id" : "Dave", "total" : 4.75 }
// { "_id" : "Karen", "total" : 13.25 }
// { "_id" : "Mike", "total" : 20.83 }
// { "_id" : "Tom", "total" : 199.99 }

//Find a total amount of money spent by Mike and Karen and sort by total
db.purchase_order.aggregate([
  { $match: { customer: { $in: ["Mike", "Karen"] } } },
  { $group: { _id: "$customer", total: { $sum: "$total" } } },
  { $sort: { total: 1 } },
]);
//output(In this query parameter must be required with $ sign)
// { "_id" : "Karen", "total" : 13.25 }
// { "_id" : "Mike", "total" : 20.83 }

//Match Examples:
//($match Stage)

db.persons.aggregate([{ $match: { city: "London" } }]);
db.persons.aggregate([{ $match: { age: { $gt: 25 } } }]);
db.persons.aggregate([
  { $match: { $and: [{ gender: "female" }, { age: { $gt: 25 } }] } },
]);
db.persons.aggregate([{ $match: { tags: { $size: 3 } } }]); //This is true when tags array have 3 element

//Group Examples
//($group Stage) _id is complsarry write in it

db.persons.aggregate([{ $group: { _id: "$age" } }]);
db.persons.aggregate([{ $group: { _id: "$company.location.country" } }]);
db.persons.aggregate([{ $group: { _id: { age: "$age", gender: "$gender" } } }]);

//Count Example
//($count Stage)
const count = [
  { $count: "allDocumentsCount" }, //allDocumentCount you can write any thing like numOfrows ,data etc
];
//Diffrent count methode
db.persons.aggregate([]).toArray().length; //it will take 1.7 mili sec and result 1000 recs(Cleint Side)
db.persons.aggregate([]).itcount(); //1.4 mili seconds(Client Side)
db.persons.aggregate([{ $count: "total" }]); //0.27 mili seconds(Server Side)
db.persons.find({}).count(); //0.27 mili seconds(Server side)

//Use above 3 stage and make query

db.persons.aggregate([
  { $match: { age: { $gte: 25 } } },
  { $group: { _id: { eyeColor: "$eyeColor", age: "$age" } } },
  { $count: "totalEyeColorAndAge" },
]);

//Sort Examples
//($sort Stage)
const sort = [{ $sort: { score: -1 } }, { $sort: { age: 1, country: -1 } }];

//Project Examples
//($project Stage)
const project = [
  { $project: { customer: 1, product: 1 } }, //its display id,customer,product field
  { $project: { _id: 0, customer: 1, product: 1 } }, //its display customer,product field
  { $project: { customer: 0, _id: 0 } }, //its display all fields except customer and _id
  { $project: { name: "$customer", _id: 0, product: 1 } },
  //Above its display name,product field where name as a customer field(name is rename of customer field)
];
//you can re name array object so its display better output
db.persons.aggregate([
  { $project: { name: 1, country: "$company.location.country" } },
]);

//Limit example
//($limit Stage)
const limit = [{ $limit: 20 }];

//Unwind Examples
//($unwind Stage)
$unwind = arrayRefrenceExpression;
db.persons.aggregate([
  { $unwind: "$tags" },
  { $project: { name: 1, index: 1, tags: 1 } },
]);
//This is the output of unwind its seprate the value
///* 1 */
// {
//     "_id" : ObjectId("5f0d59f1a94489a6e5cc5a42"),
//     "index" : 0,
//     "name" : "Aurelia Gonzales",
//     "tags" : "enim"
// }

// /* 2 */
// {
//     "_id" : ObjectId("5f0d59f1a94489a6e5cc5a42"),
//     "index" : 0,
//     "name" : "Aurelia Gonzales",
//     "tags" : "id"
// }

// /* 3 */
// {
//     "_id" : ObjectId("5f0d59f1a94489a6e5cc5a43"),
//     "index" : 1,
//     "name" : "Kitty Snow",
//     "tags" : "ut"
// }

// /* 4 */
// {
//     "_id" : ObjectId("5f0d59f1a94489a6e5cc5a43"),
//     "index" : 1,
//     "name" : "Kitty Snow",
//     "tags" : "voluptate"
// }

db.persons.aggregate([{ $unwind: "$tags" }, { $group: { _id:  "$tags" } }]);
//ABOVE EXAMPLE DISPLAY SEPRATE ubique tags value

//Accumulators($sms,$avg,$max,$min) Operators
{
  total: {
    $sum: "$quantity";
  }
}
{
  total: {
    $count: 1;
  }
} //count the number of fields

db.persons.aggregate([{ $group: { _id: "$age", count: { $sum: 1 } } }]);
db.persons.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
]);

//Unary Operators($type,$or,$lt,$gt,$and,$multiply)

{
  $type: "$age";
} //return Type int
