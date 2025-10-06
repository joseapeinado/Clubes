# Plataforma para manejo de Clubes deportivos

## Descripción

La plataforma es una aplicación web que permite a los usuarios la administración de las disciplinas, deportistas, entrenadores y control de cuotas sociales.
Quiero que la plataforma sirva para ser utilizada por diferentes clubes, por lo que el nombre del Club debe ser un parámetro de la plataforma.

## Tecnologías

La plataforma debería correr en Vercel en su versión gratuita, por lo que deberia ser lo más liviana posible. También debería utilizar una DB en Supabase para mantener el costo en cero. 

- Framework: Tailwind CSS
- Frontend: React (Next.js)
- Backend: Node.js
- Base de datos: PostgreSQL (Supabase)

Utilizar componentes opensource que sean de fácil uso y que sean mantenidos, además que sean estándares en la industria. No reinventar la rueda. 

## Funcionalidades

- Login y registro de usuarios: Login con usuario y contraseña
- Perfil de usuario: Perfil de usuario con información personal, foto, correo, teléfono, etc. También se debería poder cambiar la contraseña. Los usuarios van a ser el administrador, y los entrenadores.
- Gestión de roles y permisos: Los usuarios deberían poder tener roles diferentes y permisos diferentes. El administrador debería poder ver todo, el entrenador debería poder ver su disciplina y categoría, y el usuario debería poder ver su disciplina y categoría.
- Administración de disciplinas: Administración de disciplinas con nombre, descripción, crear categorías por género (masculino, femenino, mixto), crear categorías por edad (mini, sub-12, sub-14, sub-16, sub-18, senior, etc.)
- Administración de deportistas: Administración de deportistas con nombre, apellido, fecha de nacimiento, género, email, teléfono, etc. Se debería poder agregar deportistas a una disciplina específica.
- Administración de entrenadores: Administración de entrenadores con nombre, apellido, fecha de nacimiento, género, email, teléfono, etc. Se debería poder agregar entrenadores a una disciplina específica. Un entrenador puede tener más de una disciplina y categoría.
- Control de cuotas sociales: esto sirve sólo para control, en el cual una cuota se delara como pagada si el alumno envía el comprobante de pago. La plataforma no va a manejar el pago de las cuotas, eso se va a hacer fuera de la plataforma. 

## Diseño

La plataforma debería tener un diseño moderno y atractivo, con un diseño responsive para que se pueda usar en cualquier dispositivo.

## Tests

El código debe estar bien documentado y debe tener tests.
Deberíamos tener un directorio llamado `tests` que contenga los tests de la aplicación.
Los tests a realizar son:

- Tests unitarios
- Tests de integración
- Tests e2e (playwright)

Los tests deberían ser unattended, es decir, que se ejecuten automáticamente y no requieran interacción manual.
Crear un bash script para cada uno de los tests individualente, y crear otro script que ejecute todos los tests.
Quiero que el agente de Cursor ejecute los tests automáticamente cada vez que se hagan cambios en el código.

## Debug

En esta etapa de desarrollo, los logs deberían mostrar todo lo que se esté haciendo en la aplicación, para facilitar el debug y el tracking de errores.

## Entornos

Vamos a tener dos entornos: desarrollo y producción.

- Desarrollo: `dev.env`
- Producción: `prod.env`

Los entornos deberían ser diferentes, y los datos de conexión a la base de datos deberían ser diferentes.

### Desarrollo

El entorno de desarrollo debería ser el que se use para el desarrollo de la aplicación.

- URL: `http://localhost:3000`
- Base de datos: `postgres://postgres:postgres@localhost:5432/clubes_deportivos`
- Supabase: `http://localhost:54321`

### Producción

El entorno de producción debería ser el que se use para la aplicación en producción.

- URL: `https://clubes-deportivos.vercel.app`
- Base de datos: `postgres://postgres:postgres@localhost:5432/clubes_deportivos`
- Supabase: `https://clubes-deportivos.vercel.app`

Para el desarrollo vamos a usar containers de Docker, usando un archivo `docker-compose.yml` que incluya el frontend, el backend y la base de datos.


## Observaciones
- Mantén siempre la simplicidad, no complicar la aplicación más de lo necesario.
- Recuerda siempre documentar el código.
- Recuerda siempre ejecutar los tests después de hacer cambios en el código.
- Recuerda siempre utilizar Docker para el desarrollo.
- Evita crear archivos de un solo uso para hacer tests.

