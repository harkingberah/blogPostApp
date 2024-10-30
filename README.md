Blog Post App

Description
The Blog Post App is a web application built with Node.js, Express, and PostgreSQL that allows users to create, edit, delete, and view blog posts. It supports user authentication using local credentials and Google OAuth.

Features
- User registration and login
- Google OAuth authentication
- Create, edit, and delete blog posts
- View posts with timestamps
- Session management using Express sessions
- Password hashing with bcrypt for security

Technologies Used
- Node.js: JavaScript runtime for building the application
- Express: Web framework for Node.js
- EJS: Templating engine for rendering HTML
- PostgreSQL: Relational database for storing user and blog post data
- Passport: Middleware for authentication
- bcrypt: Library for hashing passwords
- dotenv: Environment variable management

Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harkingberah/blogPostApp.git
   cd blogPostApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   SESSION_SECRET=your_session_secret
   PG_USER=your_postgres_user
   PG_HOST=your_postgres_host
   PG_DATABASE=your_postgres_database
   PG_PASSWORD=your_postgres_password
   PG_PORT=your_postgres_port
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the application:
   ```bash
   nodemon index.js
   ```

5. Visit `http://localhost:3000` in your browser.

## Usage
- Register: Create a new account using the registration form.
- Login: Use your credentials or Google account to log in.
- Create Post: After logging in, navigate to the post creation page to add new blog entries.
- Edit Post: Access the edit page to modify existing posts.
- Delete Post: Remove posts as needed.

Contributing
Contributions are welcome! Please feel free to submit issues or pull requests.


Acknowledgments
- Thanks to the contributors of the libraries and frameworks used in this project.
```
