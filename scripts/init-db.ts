import { database, closeDatabase } from "../packages/db/client";
async function main() {
  const db = await database();
  const result = await db.query(
    "SELECT (SELECT count(*) FROM texts)::int AS texts,(SELECT count(*) FROM passages)::int AS passages",
  );
  console.log(result.rows[0]);
  await closeDatabase();
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
