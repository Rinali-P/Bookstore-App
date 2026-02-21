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

export default router;