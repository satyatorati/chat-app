import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "sarah@gmail.com",
    fullName: "Sarah",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/9.jpg",
  },
  {
    email: "emily@gmail.com",
    fullName: "Emily",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  
  {
    email: "mia@gmail.com",
    fullName: "Mia",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  
  // Male Users
  {
    email: "james@gmail.com",
    fullName: "James",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  
  {
    email: "ben@gmail.com",
    fullName: "Ben",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  
  {
    email: "henry@gmail.com",
    fullName: "Henry",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  
  
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();