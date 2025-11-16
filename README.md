Campus Issue Reporting Portal
This is a simple but powerful web application that allows students to report issues on
campus (like broken lights, cleanliness problems, etc.) and allows administrators to
track, manage, and resolve these issues.
This project is built with a classic, real-world tech stack: HTML, CSS, and JavaScript on
the front end, with a PHP backend and a MySQL database.
 Features
This app isn't just a simple form! It has a full user and admin system.
Student Features

• Student Registration: New students can create a secure account.

• Student Login: Log in to access the private dashboard.

• Report an Issue: Submit a new issue with...

o A category (Plumbing, Electrical, etc.)

o Location details

o Photo uploads

o A voice note

• Track Your Issues: View a list of all your submitted issues and their status (Submitted, In Progress, or Resolved).

• View Admin Comments: See feedback from the admin on your resolved issues.

• Delete Issues: You can delete any issue you submitted, as long as it's still in the "Submitted" status.

• Change Password: A secure page to update your password.

• Mobile-Friendly: The entire student experience is responsive and works great on a phone.
Admin Features

• Admin Login: A separate, secure login for the administrator (admin user).

• Admin Dashboard: See high-level analytics (Total Issues, Resolved, etc.).

• View All Issues: A master list of every issue reported by all students.

• Filter & Sort: Filter the list by issue status or category.

• Update Status: Change an issue's status from "Submitted" to "In Progress" or "Resolved".

• Add Admin Comments: When resolving an issue, the admin can add a comment that the student will see (e.g., "Fan was replaced").

• View User Profiles: Click on a user in the "User Management" tab to see their full profile and stats.

• Manage Users: View a list of all registered students, export their data, or delete them.
• Change Admin Password: A secure page for the admin to update their own password.

 Tech Stack

• Frontend: HTML5, CSS3, JavaScript (ES6+)

• Backend: PHP

• Database: MySQL

 How to Set Up This Project
To run this project on your own computer (or a web server), you'll need a stack like
XAMPP, MAMP, or WAMP that includes Apache, PHP, and MySQL.
1. Database Setup
1. Open your database tool (like phpMyAdmin).
2. Create a new, empty database. Let's say you call it campus_report.
3. Go to the "SQL" tab and paste the entire contents of the database_setup.sql file
(included in this project). This will create all the tables and the default admin
user for you.
2. Backend Configuration
1. Navigate to the api/ folder.
2. Open the file db_connect.php in a text editor.
3. Change the database name, username, and password to match your own:
4. $db = 'campus_report'; // Your database name
5. $user = 'root'; // Your MySQL username
6. $pass = ''; // Your MySQL password
3. Folder Permissions
Your PHP script needs to be able to save files (the photos and voice notes).
1. Find the uploads/ folder in the main project directory.
2. Give this folder "Write" or "Full Control" permissions. (On Windows, right-click >
Properties > Security > Edit).
4. Run the Project
1. Place the entire project folder (e.g., CampusIssue) inside your web server's root
folder (e.g., C:\xampp\htdocs\).
2. Open your browser and go to http://localhost/CampusIssue/
3. That's it! You should see the login page.
Default Logins
• Admin:
o ID: admin
o Password: Admin@1234
• Student:
o You can create a new one on the signup.html page.
