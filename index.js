import express from "express";
import ejs from "ejs";
import bodyParser  from "body-parser";
import pg from "pg";
import env from "dotenv";
import passport from "passport";
import bcrypt from "bcrypt";
import session from "express-session";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
const app = express();
const port = 3000;
const saltRound = 10;
env.config();
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60 * 60 * 24
    }
}));
app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
 user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect()

app.get("/", (req, res) => {
    res.render("welcome.ejs");
});
app.get("/about", (req, res) => {
    res.render("about.ejs");
});
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});
app.get("/login", (req, res) => {
    res.render("login.ejs");
});
app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/post/:id/edit", async (req, res) => {
    const { id } = req.params;
    if (req.isAuthenticated()) {
        try {
            const result = await db.query("SELECT id, post FROM posts WHERE id = $1", [id]);
            if (result.rows.length === 0) {
                console.error("Post not found with ID:", id);
                return res.status(404).send("Post not found");
            }
            const post = result.rows[0];
            res.render("edit.ejs", { post });
        } catch (error) {
            console.error("Error fetching Post details:", error);
            res.status(500).send("Server Error");
        }
    } else {
        res.redirect("/");
    }
});

app.get("/post", async(req, res) => {
    if (req.isAuthenticated()) {
        // res.render("post.ejs");
        const currentDate = new Date().toLocaleDateString(); // Better way to format date
        const currentTime = new Date().toLocaleTimeString(); // Better way to format time
        try {
            const result = await db.query("SELECT id, post FROM posts WHERE user_email = $1 ORDER BY id ASC;", [req.user.email]);

            res.render("post.ejs", {
                blogContent: result.rows,
                currentDateNow: currentDate,
                currentTimeNow: currentTime
            });
        } catch (error) {
            console.error(error);
        }
    } else {
        res.redirect("/login")
    }
});




app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/post", passport.authenticate("google", {
  successRedirect: "/post",
  failureRedirect: "/login",
}));

app.get("/logout", (req, res) => {
 req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
 });
});
app.get("/post", async(req, res) => {
    if (req.isAuthenticated()) {
        // res.render("post.ejs");
        const currentDate = new Date().toLocaleDateString(); // Better way to format date
        const currentTime = new Date().toLocaleTimeString(); // Better way to format time
        try {
            const result = await db.query("SELECT id, post FROM posts WHERE user_email = $1 ORDER BY id ASC;", [req.user.email]);

            res.render("post.ejs", {
                blogContent: result.rows,
                currentDateNow: currentDate,
                currentTimeNow: currentTime
            });
        } catch (error) {
            console.error(error);
        }
    } else {
        res.redirect("/login")
    }
});
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/post", passport.authenticate("google", {
  successRedirect: "/post",
  failureRedirect: "/login",
}));

app.get("/logout", (req, res) => {
 req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
 });
});

app.post("/delete", async (req, res) => {
    const { deletePostId } = req.body;
    if (req.isAuthenticated()) {
        try {
        await db.query('DELETE FROM Posts WHERE id = $1', [deletePostId]);
        res.redirect('/post');
    } catch (error) {
        console.error('Error deleting Post:', error);
        res.status(500).send('Server error');
    }
    } else {
        res.redirect('/login');
    }
});

app.post("/edit", async (req, res) => {
    const {id, blog } = req.body;
    try {
        await db.query("UPDATE posts SET post=$1 WHERE id = $2", [blog,id]);
        res.redirect('/post');
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).send('Server error');
    }
});



app.post("/login", passport.authenticate("local", {
    successRedirect: "/post",  // Redirect to Post on success
    failureRedirect: "/login",   // Redirect/stay on Login page if login failed
    // failureFlash: true              // Optional: Show flash message for login failure
}));


app.post("/submit", async (req, res) => {
    const { blog } = req.body; // Ensure you're extracting the blog content from the request body
    const userEmail = req.user.email; // Assuming you are storing the user's email
    // Validate input
    if (req.isAuthenticated()) {
        if (!blog) {
        return res.status(400).send("Blog content is required.");
    }

    try {
        // Insert the post into the database
        await db.query("INSERT INTO posts (post, user_email) VALUES ($1, $2)", [blog, userEmail]);
        return res.redirect("/post"); // Redirect back to the post page after submission
    } catch (error) {
        console.error("Database Insert Error:", error);
        return res.status(500).send("Internal Server Error");
    }
    }else{
        return res.redirect('/login')
   }
});

app.post("/clear-posts", async(req, res) => {
    // Clear the blogPostStorage array by reinitializing it as an empty array.
    // blogPostStorage = [];
    if (req.isAuthenticated()) {
 try {
            await db.query("DELETE FROM posts WHERE user_email = $1", [req.user.email]);
            return res.redirect("/post");
        } catch (error) {
            console.error("Error clearing posts:", error);
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.render('/login')
    }

});



app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkUser = await db.query("SELECT email from people WHERE email=$1", [email]);
        if (checkUser.rows.length > 0) {
            console.log("User already exists");
            return res.redirect("/login");
        }

        const hash = await bcrypt.hash(password, saltRound);
        await db.query("INSERT INTO people(email, password) VALUES($1, $2)", [email, hash]);

        res.redirect("/login"); // Redirect after successful registration
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal Server Error");
    }
});


passport.use("local", new Strategy(async function verify(username, password, cb) {
    try {
        const checkUser = await db.query("SELECT * FROM people WHERE email=$1", [username]);
        if (checkUser.rows.length > 0) {
            const user = checkUser.rows[0];
            bcrypt.compare(password, user.password, (err, valid) => {
                if (err) {
                    console.log("error comparing password");
                    return cb(err);
                } else {
                    if (valid) {
                        return cb(null, user);
                    } else {
                        return cb(null, false, { message: "Invalid password" });
                    }
                }
            });
        } else {
            return cb(null, false, { message: "User not found" });
        }
    } catch (error) {
        console.log(error)
    }
}))

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/post",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, cb) => {
  console.log(profile);
  try {
    const result = await db.query("SELECT * FROM people WHERE email=$1", [profile.email]);
    if (result.rows.length === 0) {
      const newUser = await db.query(
        "INSERT INTO people (email,password) VALUES ($1,$2)", [profile.email, "google"]);
      cb(null, newUser.rows[0]);
    } else {
      //Already existing user
      cb(null, result.rows[0]);
    }
  } catch (err) {
    cb(err);
  }
})
);

passport.serializeUser((user, cb) => {
    // Store just the user's email (or ID) in the session
    cb(null, user.email);  // Or use user.id if your users have an ID
});

passport.deserializeUser(async (email, cb) => {
    try {
        // Retrieve the user based on email (or ID) stored in session
        const result = await db.query("SELECT * FROM people WHERE email = $1", [email]);
        const user = result.rows[0];
        if (user) {
            cb(null, user);
        } else {
            cb(new Error("User not found"));
        }
    } catch (error) {
        cb(error);
    }
});

app.listen(port, () => {
    console.log(`currently listening from port ${port}`)
});