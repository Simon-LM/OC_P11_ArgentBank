/** @format */

import pg from "pg";
const { Client } = pg;

const client = new Client({
	host: "51.38.236.82",
	port: 5432,
	user: "argentbank_user",
	password: "azRyPtf0A&w^RZkfJy", // adapte si besoin
	database: "argentbank",
});

client
	.connect()
	.then(() => client.query('SELECT * FROM "User"'))
	.then((res) => {
		console.log(res.rows);
		return client.end();
	})
	.catch((err) => {
		console.error("Erreur SQL:", err);
		client.end();
	});
