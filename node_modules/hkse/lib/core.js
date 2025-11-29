import fs from "fs";
import pkg from "aes-js";
import * as base64 from "./base64.js";

const { ModeOfOperation: aes } = pkg;

const cSharpHeader = [
  0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0,
];
const aesKey = StringToBytes("UKu52ePUBwetZ9wNX88o54dnfKRu0T1l");
const ecb = new aes.ecb(aesKey);

export function StringToBytes(string) {
  return new TextEncoder().encode(string);
}

export function BytesToPrettyJSON(bytes) {
  const str = new TextDecoder().decode(bytes);
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return str;
  }
}

// aes decrypts and removes pkcs7 padding
export function AESDecrypt(bytes) {
  let data = ecb.decrypt(bytes);
  data = data.subarray(0, -data[data.length - 1]);
  return data;
}

// pkcs7 pads and encrypts
export function AESEncrypt(bytes) {
  let padValue = 16 - (bytes.length % 16);
  var padded = new Uint8Array(bytes.length + padValue);
  padded.fill(padValue);
  padded.set(bytes);
  return ecb.encrypt(padded);
}

// LengthPrefixedString https://msdn.microsoft.com/en-us/library/cc236844.aspx
export function GenerateLengthPrefixedString(length) {
  var length = Math.min(0x7fffffff, length); // maximum value
  var bytes = [];
  for (let i = 0; i < 4; i++) {
    if (length >> 7 != 0) {
      bytes.push((length & 0x7f) | 0x80);
      length >>= 7;
    } else {
      bytes.push(length & 0x7f);
      length >>= 7;
      break;
    }
  }
  if (length != 0) {
    bytes.push(length);
  }

  return bytes;
}

export function AddHeader(bytes) {
  var lengthData = GenerateLengthPrefixedString(bytes.length);
  var newBytes = new Uint8Array(
    bytes.length + cSharpHeader.length + lengthData.length + 1
  );
  newBytes.set(cSharpHeader); // fixed header
  newBytes.subarray(cSharpHeader.length).set(lengthData); // variable LengthPrefixedString header
  newBytes.subarray(cSharpHeader.length + lengthData.length).set(bytes); // our data
  newBytes
    .subarray(cSharpHeader.length + lengthData.length + bytes.length)
    .set([11]); // fixed header (11)
  return newBytes;
}

export function RemoveHeader(bytes) {
  // remove fixed csharp header, plus the ending byte 11.
  bytes = bytes.subarray(cSharpHeader.length, bytes.length - 1);
  // remove LengthPrefixedString header
  let lengthCount = 0;
  for (let i = 0; i < 5; i++) {
    lengthCount++;
    if ((bytes[i] & 0x80) == 0) {
      break;
    }
  }
  bytes = bytes.subarray(lengthCount);

  return bytes;
}

// Node.js Buffer-based Base64 decode
export function Decode(bytes) {
  bytes = bytes.slice();
  bytes = RemoveHeader(bytes);
  bytes = base64.decode(bytes);
  bytes = AESDecrypt(bytes);
  return BytesToPrettyJSON(bytes);
}

// Node.js Buffer-based Base64 encode
export function Encode(jsonString) {
  var bytes = StringToBytes(jsonString);
  bytes = AESEncrypt(bytes);
  bytes = base64.encode(bytes);
  return AddHeader(bytes);
}

export function pathCrypt(path, outputPath, action) {
  if (action == "e") {
    if (!fs.existsSync(path)) throw new Error(`${path} not found`);
    const jsonData = JSON.stringify(JSON.parse(fs.readFileSync(path, "utf-8")));
    let encrypted = Encode(jsonData);
    fileWrite(path, outputPath, encrypted, "e");
  } else if (action == "d") {
    if (!fs.existsSync(path)) throw new Error(`${path} not found`);
    const data = fs.readFileSync(path);
    const bytes = new Uint8Array(data);
    let decrypted = Decode(bytes);
    fileWrite(path, outputPath, decrypted, "d");
  }
}

function fileWrite(path, outputPath, data, action) {
  if (action == "d") {
    if (!outputPath) outputPath = path.replace(/\.dat$/i, ".json");
    fs.writeFileSync(outputPath, data, "utf-8");
  } else if (action == "e") {
    if (!outputPath) outputPath = path.replace(/\.json$/i, ".dat");
    fs.writeFileSync(outputPath, data);
  }

  console.log(
    `${action === "d" ? "Decrypted" : "Encrypted"} ${path} -> ${outputPath}`
  );
}
