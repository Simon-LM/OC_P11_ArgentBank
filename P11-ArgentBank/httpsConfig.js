/** @format */

import { readFileSync } from "fs";
import { resolve } from "path";

export const key = readFileSync(resolve(__dirname, "localhost-key.pem"));
export const cert = readFileSync(resolve(__dirname, "localhost.pem"));
