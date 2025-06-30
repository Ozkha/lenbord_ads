## Testing
Proceso para realizar los tests.
1. Crear una shema/(base de datos) con el nombre que se identificara para el testing
2. En las varaiables de entorno establecer el `ENV_MODE` a `ENV_MODE=TEST`
3. Obtener el connection string de la base de datos y estabecerla en las variables de entorno como `TEST_DATABASE_URL` a `TEST_DATABASE_URL=<el connection string>`
4. Ejecutar la migracion de drizzleORM. (`$ npm run db:migrate`)
5. Ejecutar los tests `npm run test`
6. Eliminar lo hecho en la base de datos o crear una nueva y repetir el proceso, o eliminar la base de datos creada para los tests y crear una nueva.
