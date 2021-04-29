const crypto = require("crypto");
const { readFileSync, writeFileSync } = require("fs");

let key = "123456789abcdefg";
// console.log("加密的key:", key);
let iv = "abcdefg123456789";
// console.log("加密的iv:", iv);
let method = "aes-128-cbc";

let cbuff = [];
let dbuff = [];

let encoded = crypto.createCipheriv(method, key, iv);

const inputFile = `./backend.js`;
const outputFile = `./serviceCore`;

cbuff.push(encoded.update(readFileSync(inputFile), "utf-8", "base64"));
cbuff.push(encoded.final("base64"));
// console.log(cbuff);
let decoded = crypto.createDecipheriv(method, key, iv);

for (const item of cbuff) {
  dbuff.push(decoded.update(item, "base64", "utf-8"));
}
dbuff.push(decoded.final("utf-8"));
// console.log(decoded.update(cbuff[0], "hex", "utf-8"));
// console.log(dbuff.join(""));

// console.log(dbuff);
writeFileSync(outputFile, JSON.stringify(cbuff));
