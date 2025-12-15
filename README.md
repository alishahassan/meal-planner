Group Name:  Java Jesters
Group Members: Alisha Hassan, Matthew Kovalcik, Naomi Yokoo, Noah Cirks, Vivien Latt

Project: The Pantry
Given the items in a user's pantry, the website will suggest recipes they could make based on ingredients they want to use or a recipe name. The website has four main pages:
- An ingredients page where the user can list the ingredients they have
- A search page where the user can search for recipes based on ingredients owned or recipe name
- A meal tracking page where the user can log what meals they've had or wish to have
- A meal planning page where there will be recommendations of what meals the user should make based on what they currently have in “The Pantry” and nutritional dieting goals (e.g. daily caloric intake)

The website has an authentication mechanism, with log in and sign up API tokens, as the user authentication includes an email and a password that connects them to their unique UserID in our Supabase database.

How to install and run the website.
1. You must download the zip file of the FinalProject folder
2. In your terminal, you must change directories so you are within the root project folder level, {user} FinalProject % ...
3. Run this command: live-server
4. The website will open in your Chrome browser so please ensure you have Chrome running already
5. From there, you must sign up and log in to utilize The Pantry, Meal Tracking, and Meal Planning tabs
6. To Sign Up, click on the Log In button on the top right of the page and then click on Sign Up
7. Once you enter your credentials, check your email for an authentication link. Once you click on the link, you may go back to the Log In page and log in using those credentials.
8. Now, you are free to add ingredients to your Pantry, and add meals to your Meal Tracker. The Meal Planning tab will also start to recommend you meals throughout the week based on what you have in your Pantry and dieting goals (e.g. daily caloric intake)
9. Enjoy the website!

If you do not want to sign up, you make use a pre-existing log in credential and log in using this email and password:
Email: velatt@syr.edu
Password: 123456789

Disclaimer: Searching with multiple ingredients checkboxed will most likely yield no matching recipes based on how we implemented the "add ingredient" feature. Due to time constraints, we were only able to implement the "add ingredient" feature by having the user input an ingredient, and searching the database for the first matching ingredient value in the database and inputting that into the user's pantry. This way, when a user checkboxes one of those ingredients, matching meals that include that value will pop up. So, please test the "Search Recipes with Selected Items" checkboxing only one ingredient item at a time. Thank you!
