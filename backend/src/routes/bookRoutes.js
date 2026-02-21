import express from "express";
import cloudinary from "cloudinary";
import Book from "../models/Book.js";

const router = express.Router();

// create a new book
router.post("/", protectRoute, async (req, res) => {
  try {
      
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) 
      return res.status(400).json({ message: "Please provide all fields" });

    // upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id
    })

    await newBook.save();
    res.status(201).json({ message: "Book created successfully", book: newBook });

  } catch (error) {
      console.log("Error in creating book:", error);
      res.status(500).json({ message: error.message });
  }

});

router.get("/", protectRoute, async (req, res) => {
  // Example call from React Native - frontend:
  // const response = await fetch("http://localhost:5000/api/books?page=1&limit=5")
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    // get all books
    const books = (await Book.find())
      .sort({ createdAt: -1 }) //decending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage"); // populate user field with username only

      const totalBooks = await Book.countDocuments();
    
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalBooksPages: Math.ceil(totalBooks / limit)
    });

  } catch (error) {
    console.log("Error in getting books:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;