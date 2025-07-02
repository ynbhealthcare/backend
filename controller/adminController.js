import adminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";
import galleryModel from "../models/galleryModel.js";
import blogModel from "../models/blogModel.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import attributeModel from "../models/attributeModel.js";
import tagModel from "../models/tagModel.js";
import homeModel from "../models/homeModel.js";
import homeLayoutModel from "../models/homeLayoutModel.js";
import folderModel from "../models/folderModel.js";
import csv from "csv-parser";
import { stringify } from "csv-stringify";
import csvParser from 'csv-parser';
import pageModel from "../models/pageModel.js";
// image function

import multer from "multer";
import { unlink } from "fs/promises";
import imageSize from "image-size";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

import { dirname } from "path";
import ratingModel from "../models/ratingModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import zonesModel from "../models/zonesModel.js";
import taxModel from "../models/taxModel.js";
import promoModel from "../models/promoModel.js";
import productVarientModel from "../models/productVarientModel.js";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import wishlistModel from "../models/wishlistModel.js";
import compareModel from "../models/compareModel.js";
import enquireModel from "../models/enquireModel.js";
import planCategoryModel from "../models/planCategoryModel.js";
import planModel from "../models/planModel.js";
import departmentsModel from "../models/departmentsModel.js";
import buyPlanModel from "../models/buyPlanModel.js";
import puppeteer from "puppeteer";
 import { exec } from "child_process";
import util from "util";
import crypto from "crypto";  // Ensure you require the crypto module if you haven't
import consultationModel from "../models/ConsultationModel.js";
import axios from "axios";
import nurseDepartmentsModel from "../models/nurseDepartmentsModel.js";
import skillDepartmentsModel from "../models/skillDepartmentsModel.js";
import attributeDepartmentsModel from "../models/attributeDepartmentsModel.js";
import mongoose from "mongoose";
import leadProductModel from "../models/leadProductModel.js";

const execPromise = util.promisify(exec);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder where uploaded images will be saved
    cb(null, "public/uploads/new");
  },
  filename: function (req, file, cb) {
    // Define the filename for the uploaded image
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

export const SignupAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }

    const existingadmin = await adminModel.findOne({ email });
    if (existingadmin) {
      return res.status(401).send({
        success: false,
        message: "admin Already exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // save new admin
    const admin = await new adminModel({ email, password: hashedPassword });
    await admin.save();
    return res.status(201).send({
      success: true,
      message: "admin created sucessfully",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on signup ${error}`,
      success: false,
      error,
    });
  }
};


export const ForgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide an email address",
      });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD,// Update with your email password
      }
    });

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      subject: 'Cayro Shop Panel OTP ',
      text: `OTP: ${otp}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send email');
      } else {

        return res.status(200).send({
          success: true,
          message: "OTP sent to your email address",
          otp
        });

      }
    });


  } catch (error) {
    return res.status(500).send({
      message: `Error on forgot password: ${error}`,
      success: false,
      error,
    });
  }
};

export const ChangePassAdmin = async (req, res) => {

  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email, current password, and new password",
      });
    }

    // Find the admin by email
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }


    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(password, 10);


    const newToken = jwt.sign({ email: admin.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Update the admin's password and token with the new values
    admin.password = hashedNewPassword;
    admin.token = newToken;
    await admin.save();

    return res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Error on change password:", error);
    return res.status(500).send({
      message: "Failed to change password",
      success: false,
      error: error.message, // Return error message for debugging
    });
  }


};


export const Adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(200).send({
        success: false,
        message: "email is not registerd",
        admin,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        admin,
      });
    }

    return res.status(200).send({
      success: true,
      message: "login sucesssfully",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      success: false,
      error,
    });
  }
};

function formatFileSize(bytes) {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return kilobytes.toFixed(2) + " KB";
  }
  const megabytes = kilobytes / 1024;
  return megabytes.toFixed(2) + " MB";
}

export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const uploadedImage = req.file;
    const imageName = uploadedImage.originalname;
    const filename = uploadedImage.filename;

    const fileSizeFormatted = formatFileSize(uploadedImage.size); // Assuming this function is defined elsewhere
    const dimensions = imageSize(uploadedImage.path); // Assuming this function is defined elsewhere
    const width = dimensions.width;
    const height = dimensions.height;
    const title = imageName.substring(0, imageName.lastIndexOf("."));

    const filePathAndName = `new/${filename}`;

    let newImage;
    if (!req.query.id) { // Check if id is not provided or undefined
      newImage = new galleryModel({
        title: title,
        filePath: filePathAndName,
        fileType: uploadedImage.mimetype,
        fileSize: fileSizeFormatted,
        dimensions: `${width}x${height}`,
      });
    } else {
      newImage = new galleryModel({
        title: title,
        filePath: filePathAndName,
        fileType: uploadedImage.mimetype,
        fileSize: fileSizeFormatted,
        dimensions: `${width}x${height}`,
        folderId: req.query.id, // Use the provided id
      });
    }

    await newImage.save();

    res.status(200).json({ success: true, message: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};


export const getAllGalleryController = async (req, res) => {
  try {
    const gallery = await galleryModel.find({});
    if (!gallery) {
      return res.status(200).send({
        message: "NO Gallery Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Gallery List ",
      BlogCount: gallery.length,
      success: true,
      gallery,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Gallery ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteGalleryController = async (req, res) => {
  try {
    const image = await galleryModel.findById(req.params.id);

    if (!image) {
      return res.status(404).send({
        success: false,
        message: "Gallery not found",
      });
    }

    // Get the current module's file path
    const __filename = fileURLToPath(import.meta.url);

    // Get the current module's directory name
    const __dirname = dirname(__filename);

    // Construct the file path on the server
    const imagePath = path.join(__dirname, "../public/uploads", image.filePath);

    // Check if the file exists before attempting to delete it
    try {
      await fs.unlink(imagePath); // Delete the file asynchronously
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    // Delete the gallery item from the database
    await galleryModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Gallery Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Gallery",
      error,
    });
  }
};

export const uploadImage = upload.single("image");

export const AddAdminBlogController = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      metaTitle,
      slug,
      metaDescription,
      metaKeywords,
    } = req.body;
    //validation
    if (!title) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    const newBlog = new blogModel({
      title,
      description,
      image,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
    });
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog Created!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting blog",
      error,
    });
  }
};


export const getAllBlogAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { title: regex },
        { slug: regex },
      ];
    }

    const totalUser = await blogModel.countDocuments(query); // Count total documents matching the query

    const Blog = await blogModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Blog || Blog.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Blogs Available",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Blog list",
      Count: Blog.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Blog, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while All Blog: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const AdmindeleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      // .findOneAndDelete(req.params.id)
      .findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};


export const AddAdminCategoryController = async (req, res) => {
  try {
    const {
      title,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status,
      slide_head,
      slide_para,
      specifications, canonical
    } = req.body;

    // Validation
    if (!title || !slug) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // Create a new category with the specified parent
    const newCategory = new categoryModel({
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status,
      specifications, canonical
    });
    await newCategory.save();

    return res.status(201).send({
      success: true,
      message: "Category Created!",
      newCategory,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return res.status(400).send({
      success: false,
      message: "Error While Creating Category",
      error,
    });
  }
};


export const AddAdminLeadController = async (req, res) => {
  try {
    const {
      type, discount,subtotal,shipping,applyIGST,applyCGST,
      applySGST,finalTotal,taxTotal, addRental,
      addReceived,addReturn,addProduct,
      userId,UserDetails,employeeSaleId,PickupDate,ReturnDate,SecurityAmt,
      AdvanceAmt,employeeId,OnBoardDate,dutyHr,addHistory,date,time,comment,requirement,Ldate,Ltime,product,source
    } = req.body;
    console.log(req.body)

    // Validation
    if (!type || !comment || !requirement ) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
  
    }

      
       // Calculate the auto-increment ID
        const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
        let order_id;
    
        if (lastOrder) {
          // Convert lastOrder.orderId to a number before adding 1
          const lastOrderId = parseInt(lastOrder.orderId);
          order_id = lastOrderId + 1;
        } else {
          order_id = 1;
        } 

      

    // Create a new category with the specified parent
    const newData = new orderModel({
      orderId:order_id,
      type, 
      UserDetails,
      employeeSaleId, 
       status:0,
       leadType:0,
       follow : 0,
        date,
        time,
        comment,
        requirement,
       addHistory : addHistory || [],
       Ldate,
       Ltime,
       product,
       source,
       lead:0,
    });
 

    await newData.save();

    return res.status(201).send({
      success: true,
      message: "Lead Created!",
      newData,
    });
  } catch (error) {
    console.error("Error while Lead Creating:", error);
    return res.status(400).send({
      success: false,
      message: `Error While Lead Creating: ${error}`,
      error,
    });
  }
};


export const AddAdminOrderController = async (req, res) => {
  try {
    const {
      order, discount,subtotal,shipping,applyIGST,applyCGST,
      applySGST,finalTotal,taxTotal, addRental,
      addReceived,addReturn,addProduct,
      userId,UserDetails,employeeSaleId,PickupDate,ReturnDate,SecurityAmt,
      AdvanceAmt,employeeId,OnBoardDate,dutyHr,addHistory
    } = req.body;

    console.log(req.body)
    // Validation
    if (!order || !finalTotal) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    const Newuser = new userModel({ username:UserDetails.name,phone:UserDetails.phone, email:UserDetails.email, address :UserDetails.address,gender : UserDetails.gender,type :2,
      company : UserDetails.company,companyName : UserDetails.companyName,companyGST : UserDetails.companyGST,companyAddress : UserDetails.companyAddress,age : UserDetails.age,weight : UserDetails.weight });
    if(UserDetails && UserDetails.id === 'none'){
     await Newuser.save();
     }

      
       // Calculate the auto-increment ID
        const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
        let order_id;
    
        if (lastOrder) {
          // Convert lastOrder.orderId to a number before adding 1
          const lastOrderId = parseInt(lastOrder.orderId);
          order_id = lastOrderId + 1;
        } else {
          order_id = 1;
        } 

        console.log('userId : Newuser.id',userId , Newuser.id);
        console.log('userId : final.id',userId ?? Newuser?.id);
        
        let finaluser ;
        if(UserDetails && UserDetails.id === 'none'){
          finaluser = Newuser._id;
        }else{
          finaluser = UserDetails.id;
        }
        console.log('finaluser',finaluser);

    // Create a new category with the specified parent
    const newData = new orderModel({
      type: order,
      userId: finaluser,
      UserDetails,
      employeeSaleId,
      employeeId: employeeId || null,
      PickupDate,ReturnDate: ReturnDate || PickupDate,SecurityAmt,AdvanceAmt,
       addRental,
       addReceived,
       addReturn,
       addProduct,
       discount,
       subtotal,
       shipping,
       applyIGST,
       applyCGST,
       applySGST,
       totalAmount: finalTotal,
       taxTotal, 
       orderId:order_id,
       status:0,
       OnBoardDate,
       dutyHr,
       addHistory : addHistory || [],
        leadType:1,
    });

    if(addProduct){
       
      for (let product of addProduct ) {
        // Retrieve the product details
        const productDetails = await productModel.findById(product._id);
    
        if (!productDetails) {
          console.log(`Product not found: ${product._id}`);
          continue; // Skip if product is not found
        }
        if ( ( productDetails?.reStock || productDetails?.stock ) && ( productDetails?.reStock > 0 || productDetails?.stock > 0 ) ) {

        if(newData.type !== 1){

        // Add 1 to the stock of each product
        const updatedStock = productDetails.reStock - 1;
    
        // Update the stock for the product
        productDetails.reStock = updatedStock;

        // Save the updated product
        await productDetails.save();

        }else{

           // Add 1 to the stock of each product
        const updatedStock = productDetails.stock - 1;
    
        // Update the stock for the product
        productDetails.stock = updatedStock;

        // Save the updated product
        await productDetails.save();

        }
       
        
        }

        console.log(`Added 1 stock for product ${product.title}`);
      }
  
    }
   

    await newData.save();

    return res.status(201).send({
      success: true,
      message: "Order Created!",
      newData,
    });
  } catch (error) {
    console.error("Error while order Creating:", error);
    return res.status(400).send({
      success: false,
      message: `Error While order Creating: ${error}`,
      error,
    });
  }
};

export const getOrderIdAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const Order = await orderModel.findById(id).populate({
      path: 'userId', 
      select: 'username email phone'
    });

    if (!Order) {
      return res.status(200).send({
        message: "Order Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Order!",
      success: true,
      Order,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Order: ${error}`,
      success: false,
      error,
    });
  }
};

export const GetAllCategoriesByParentIdController_new = async (req, res) => {
  try {
    const { parentId } = req.params;
    const perPage = 10; // Default number of results per page

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title")
      .lean();

    const queryParameters = req.query; // Extract query parameters

    const filters = { Category: parentId }; // Apply parentId filter

    // Construct filters based on the query parameters (variations)
    Object.keys(queryParameters).forEach((param) => {
      if (param !== "Category") {
        // Split parameter values by comma if present
        const paramValues = queryParameters[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      }
    });

    // Query products with pagination and apply filters
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .limit(perPage) // Limit initial results to perPage
      .lean();

    const proLength = products.length;

    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      perPage, // Send perPage value to the frontend
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const GetAllCategoriesByParentIdController = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title")
      .select("title")
      .lean();

    const queryParameters = req.query; // Extract query parameters

    const filters = { Category: parentId }; // Apply parentId filter

    // Construct filters based on the query parameters (variations)
    Object.keys(queryParameters).forEach((param) => {
      if (param !== "Category") {
        // Split parameter values by comma if present
        const paramValues = queryParameters[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      }
    });

    const products = await productModel
      .find(filters)
      .select("_id")
      .select("title")
      .select("regularPrice")
      .select("salePrice")
      .select("pImage")
      .select("variations")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllCategoriesByParentId = async (parentId) => {
  try {
    const categories = await categoryModel.find({ parent: parentId }).lean();

    if (!categories || categories.length === 0) {
      return [];
    }

    const result = [];

    for (const category of categories) {
      const { _id, title, image /* other fields */ } = category;

      const categoryData = {
        _id,
        title,
        image,
        subcategories: await getAllCategoriesByParentId(_id), // Recursive call
      };

      result.push(categoryData);
    }

    return result;
  } catch (error) {
    console.error("Error while fetching categories:", error);
    throw error;
  }
};

export const AdmingetAllCategories = async () => {
  try {
    const categories = await categoryModel
      .find({ parent: { $exists: false } })
      .lean();

    return categories;
  } catch (error) {
    console.error("Error while fetching top-level categories:", error);
    throw error;
  }
};

export const getAllcategoryFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { slug: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalCategory = await categoryModel.countDocuments();

    const Category = await categoryModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Category) {
      return res.status(200).send({
        message: "NO category found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All category list ",
      CategoryCount: Category.length,
      currentPage: page,
      totalPages: Math.ceil(totalCategory / limit),
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status, specifications, canonical, filter
    } = req.body;
    console.log('filter',filter)

    let updateFields = {
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent:parent|| null,
      status, specifications, canonical,filter
    };

    const Category = await categoryModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Category Updated!",
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Category: ${error}`,
      success: false,
      error,
    });
  }
};

export const getCategoryIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Category = await categoryModel.findById(id);
    if (!Category) {
      return res.status(200).send({
        message: "Category Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Category!",
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Category: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteCategoryAdmin = async (req, res) => {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Employee Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Employee",
      error,
    });
  }
};


export const deleteUserAdmin = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "userModel Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Employee",
      error,
    });
  }
};

export const AddAdminProduct_old = async (req, res) => {
  try {
    const {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag,
      features,
      specifications, gst, weight, hsn, sku, canonical, reStock ,serialNumber,brandName,modelNo,protype
    } = req.body;

    if(!protype){
       return res.status(400).send({
        success: false,
        message: "Select product to show",
      });
    }
    // Validation
    if (!title  || !salePrice) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }


    let updatespecifications;

    if (!specifications || !specifications.specifications || !specifications.specifications[0] || !specifications.specifications[0].heading) {
      updatespecifications = {
        "specifications": [
          {
            "heading": " ",
            "labels": [
              {
                "label": " ",
                "value": " "
              }
            ]
          }
        ]
      };
    } else {
      updatespecifications = specifications;
    }

    const lastProduct = await productModel.findOne().sort({ _id: -1 }).limit(1);

    // Initialize p_id
    let p_id;

    // Check if a last product was found
    if (!lastProduct) {
      p_id = 0; // If no products are found, start with 0
    } else {
      // Convert p_id to a number if it's a string
      const lastProductId = typeof lastProduct.p_id === 'string' ? parseFloat(lastProduct.p_id) : lastProduct.p_id;
      p_id = lastProductId + 1; // Calculate the new p_id
    }

    console.log('p_idp_idp_id', p_id)
    // Create a new category with the specified parent

    const updateproduct = {
      p_id,
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag,
      features,
      specifications: updatespecifications, gst, weight, hsn, sku, canonical, reStock ,serialNumber,brandName,modelNo,
      protype: protype || 0
    }

    const newProduct = new productModel(updateproduct);


    await newProduct.save();

    return res.status(201).send({
      success: true,
      message: "Product Added Success!",
      newProduct,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return res.status(400).send({
      success: false,
      message: "Error While Adding Product",
      error,
    });
  }
};
 

export const AddAdminProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag,
      features,
      specifications,
      gst,
      weight,
      hsn,
      sku,
      canonical,
      reStock,
      serialNumber,
      brandName,
      modelNo,
      protype,
      Rentalgst
    } = req.body;

    if (!protype) {
      return res.status(400).send({
        success: false,
        message: "Select product to show",
      });
    }

    if (!title || !salePrice) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // Validate and clean up specifications
    let updatespecifications;
    if (
      !specifications ||
      !specifications.specifications ||
      !specifications.specifications[0] ||
      !specifications.specifications[0].heading
    ) {
      updatespecifications = {
        specifications: [
          {
            heading: " ",
            labels: [
              {
                label: " ",
                value: " "
              }
            ]
          }
        ]
      };
    } else {
      updatespecifications = specifications;
    }

    // Sanitize Category field
    let validCategory = [];
    if (Array.isArray(Category)) {
      validCategory = Category.filter(
        (cat) => cat && mongoose.Types.ObjectId.isValid(cat)
      );
    } else if (typeof Category === 'string' && mongoose.Types.ObjectId.isValid(Category)) {
      validCategory = [Category];
    }

    // Generate new p_id
    const lastProduct = await productModel.findOne().sort({ _id: -1 }).limit(1);
    let p_id = lastProduct ? Number(lastProduct.p_id || 0) + 1 : 0;

    const updateproduct = {
      p_id,
      title,
      description,
      pImage,
      images,
      slug : slug || 'product_'+p_id,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category: validCategory,
      tag,
      features,
      specifications: updatespecifications,
      gst,
      weight,
      hsn,
      sku,
      canonical,
      reStock,
      serialNumber,
      brandName,
      modelNo,
      protype: protype || 0,
      Rentalgst
    };

    const newProduct = new productModel(updateproduct);
    await newProduct.save();

    return res.status(201).send({
      success: true,
      message: "Product Added Success!",
      newProduct,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return res.status(400).send({
      success: false,
      message: "Error While Adding Product",
      error,
    });
  }
};


export const getAllProductFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const type = req.query.type || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    
    if (type !== '') {
      // If type is passed, filter by exact protype value
      query.protype = type;
    } else {
      // Default: Show products where protype != 0 or not present
      query.$or = [
        { protype: { $eq: 0 } },
        { protype: { $exists: false } }
      ];
    }

    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { slug: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }
 


    const totalProduct = await productModel.countDocuments();

    const Product = await productModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Product) {
      return res.status(200).send({
        message: "NO category found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All category list ",
      ProductCount: Product.length,
      currentPage: page,
      totalPages: Math.ceil(totalProduct / limit),
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag, features,protype,
      specifications, weight, gst, hsn, sku, variant_products, type, canonical, testimonials, oneto7, eightto14, fivto30, monthto3month, threemonthto6month,reStock,serialNumber,brandName,modelNo,
      Rentalgst, recommended_products
    } = req.body;

    console.log('typp', type);
    console.log('Type of type:', typeof type);
    let updateFields = {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag, features,
      specifications, weight, gst, hsn, sku, variant_products, type, canonical, testimonials,
      oneto7, eightto14, fivto30, monthto3month, threemonthto6month,reStock,serialNumber,brandName,modelNo,protype,Rentalgst,recommended_products
    };

    const Product = await productModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "product Updated!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating product: ${error}`,
      success: false,
      error,
    });
  }
};

export const getProductIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = await productModel.findById(id);
    if (!Product) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};


export const deleteProductAdmin = async (req, res) => {
  try {
    // Find and delete the product
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

    // If product is successfully deleted
    if (deletedProduct) {
      // Remove corresponding wishlist entries
      await wishlistModel.deleteMany({ productId: req.params.id });

      await compareModel.deleteMany({ productId: req.params.id });

      return res.status(200).send({
        success: true,
        message: "Product deleted!",
      });

    } else {
      // If product doesn't exist
      return res.status(404).send({
        success: false,
        message: "Product not found.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};


export const AddAdminAttributeController = async (req, res) => {
  try {
    const { name, image, type, color, value, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newAttribute = new attributeModel({
      name,
      image,
      type,
      color,
      value,
      status,
    });
    await newAttribute.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Created!",
      newAttribute,
    });
  } catch (error) {
    console.error("Error while creating attribute:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating attribute",
      error,
    });
  }
};

export const getAllAttributeFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalattribute = await attributeModel.countDocuments();

    const Attribute = await attributeModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Attribute) {
      return res.status(200).send({
        message: "NO attribute found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All attribute list ",
      AttributeCount: Attribute.length,
      currentPage: page,
      totalPages: Math.ceil(totalattribute / limit),
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateAttributeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, image, type, color, value, status } = req.body;

    let updateFields = {
      name,
      image,
      type,
      color,
      value,
      status,
    };

    const Attribute = await attributeModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Attribute Updated!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating attribute: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAttributeIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Attribute = await attributeModel.findById(id);
    if (!Attribute) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteAttributeAdmin = async (req, res) => {
  try {
    await attributeModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Attribute Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Attribute",
      error,
    });
  }
};

export const getAllAttribute = async (req, res) => {
  try {
    const Attribute = await attributeModel.find({}).lean();
    if (!Attribute) {
      return res.status(200).send({
        message: "NO Attribute Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute List ",
      BlogCount: Attribute.length,
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Blogs ${error}`,
      success: false,
      error,
    });
  }
};

export const AddAdminTagController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newTag = new tagModel({ name });
    await newTag.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Created!",
      newTag,
    });
  } catch (error) {
    console.error("Error while creating tag:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating tag",
      error,
    });
  }
};

export const getAllTagFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        // { value: { $regex: searchTerm, $options: 'i' } },    // Case-insensitive email search
      ];
    }

    const totalTag = await tagModel.countDocuments();

    const Tag = await tagModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Tag) {
      return res.status(200).send({
        message: "NO tag found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All tag list ",
      TagCount: Tag.length,
      currentPage: page,
      totalPages: Math.ceil(totalTag / limit),
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting tag ${error}`,
      success: false,
      error,
    });
  }
};

export const updateTagAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    let updateFields = {
      name,
    };

    const Attribute = await tagModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Tag Updated!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating tag: ${error}`,
      success: false,
      error,
    });
  }
};

export const getTagIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Tag = await tagModel.findById(id);
    if (!Tag) {
      return res.status(200).send({
        message: "Tag Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Tag!",
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get tag: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteTagAdmin = async (req, res) => {
  try {
    await tagModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Tag Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tag",
      error,
    });
  }
};

export const getAllTag = async (req, res) => {
  try {
    const Tag = await tagModel.find({}).lean();
    if (!Tag) {
      return res.status(200).send({
        message: "NO Tag Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Tag List ",
      BlogCount: Tag.length,
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Tag ${error}`,
      success: false,
      error,
    });
  }
};





export const editHomeData = async (req, res) => {
  try {

    const {
      meta_title,
      meta_description,
      meta_head,
      meta_logo,
      meta_favicon,
      header,
      footer,
      contact_details,
      payment_method,
      footer_credit,
      phone,
      email,
      address,
      cash,
      razorpay
    } = req.body;

    console.log(meta_favicon)
    let updateFields = {
      meta_title,
      meta_description,
      meta_head,
      meta_logo,
      meta_favicon,
      header,
      footer,
      contact_details,
      payment_method,
      footer_credit, phone,
      email,
      address,
      cash,
      razorpay
    };

    const homeData = await homeModel.findOneAndUpdate({}, updateFields, {
      new: true,
    });

    if (homeData) {
      return res.status(200).json({
        message: "Home Settings Updated!",
        success: true,
        homeData,
      });
    } else {
      return res.status(404).json({
        message: "Home Settings not found.",
        success: false,
      });
    }

  } catch (error) {
    return res.status(400).json({
      message: `Error while Home Settings updating: ${error}`,
      success: false,
      error,
    });
  }
};



export const editHomeLayoutData = async (req, res) => {
  try {

    const {
      home_slider,
      trending_product,
      trending_product_banner,
      trending_highlights_carousal,
      service_category_carousal,
      service_category_Images,
      service_logos,
      service_banner_images, slider_img, top_bar,
      trending_product_carousal,
      best_selling_laptop,
      collection_heading,
      collection_paragraph,
      collection_url,
      collection_img,
      latest_product,
      latest_product_banner,
      latest_product_carousal,
      best_selling_smartphone,
      recommended_products,
      home_doctor,
    } = req.body;

    console.log('top_bar', top_bar)
    let updateFields = {
      home_slider,
      trending_product,
      trending_product_banner,
      trending_highlights_carousal,
      service_category_carousal,
      service_category_Images,
      service_logos,
      service_banner_images, slider_img, top_bar,
      trending_product_carousal,
      best_selling_laptop,
      collection_heading,
      collection_paragraph,
      collection_url,
      collection_img,
      latest_product,
      latest_product_banner,
      latest_product_carousal,
      best_selling_smartphone,
      recommended_products,
      home_doctor
    };

    const homeLayoutData = await homeLayoutModel.findOneAndUpdate({}, updateFields, {
      new: true,
    });

    if (homeLayoutData) {
      return res.status(200).json({
        message: "Home Layout Updated!",
        success: true,
        homeLayoutData,
      });
    } else {
      return res.status(404).json({
        message: "Home Layout not found.",
        success: false,
      });
    }

  } catch (error) {
    return res.status(400).json({
      message: `Error while Home Layout updating: ${error}`,
      success: false,
      error,
    });
  }
};

// for reviews

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { userId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { productId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalrating = await ratingModel.countDocuments(query); // Count documents matching the query

    const Rating = await ratingModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        model: userModel,
        select: "username",
      })
      .populate({
        path: "productId",
        model: productModel,
        select: "title",
      })
      .lean();

    if (!Rating || Rating.length === 0) {
      return res.status(200).send({
        message: "No ratings found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All rating list",
      ratingCount: Rating.length,
      currentPage: page,
      totalPages: Math.ceil(totalrating / limit),
      success: true,
      Rating,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting ratings: ${error}`,
      success: false,
      error,
    });
  }
};

// for Enquire 

export const getAllEnquireAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { userId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { productId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalpage = await enquireModel.countDocuments(query); // Count documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquire found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Enquire list",
      ratingCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(totalpage / limit),
      success: true,
      Enquire,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAllConsultationEnquireAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { fullname: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { email: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalpage = await consultationModel.countDocuments(query); // Count documents matching the query

    const Enquire = await consultationModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquire found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Enquire list",
      ratingCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(totalpage / limit),
      success: true,
      Enquire,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteRatingAdmin = async (req, res) => {
  try {
    await ratingModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Rating Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Rating",
      error,
    });
  }
};




export const editReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      status,
    };

    const rating = await ratingModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Rating Updated!",
      success: true,
      rating,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};

// for order 



export const getAllOrderAdmin_old = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const statusFilter = req.query.status || ''; // Get status filter from the query parameters and split into an array
    const productId = req.query.productId || '';
    const type = req.query.type || '';
    
    const notStatus = req.query.notStatus || ''; // Get status filter from the query parameters and split into an array


    const startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { orderId: regex },
        { mode: regex },
      ];
    }
    // Add status filter to the query if statusFilter is provided
    if (statusFilter.length > 0) {
      query.status = { $in: statusFilter }; // Use $in operator to match any of the values in the array
    }

    
    if (notStatus) {
      const notStatusArray = notStatus.split(',').map(Number);
      query.status = { $nin: notStatusArray };
    }

    

    

 // Add status filter to the query if statusFilter is provided
 if (type.length > 0) {
  query.type = { $in: type }; // Use $in operator to match any of the values in the array
 }

    

      // Add date range filtering to the query
      if (startDate && endDate) {
        query.createdAt = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.createdAt = { $gte: startDate };
      } else if (endDate) {
        query.createdAt = { $lte: endDate };
      }
      
      if (productId) {
        query['addProduct._id'] = productId; // Simple string match
      }

    const total = await orderModel.countDocuments(query); // Count total documents matching the query

    const Order = await orderModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeSaleId",
        model: userModel,
        select: "username email phone",
      })
      .lean();


    if (!Order || Order.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Order Found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Order list",
      Count: Order.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Order, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Order: ${error.message}`,
      success: false,
      error,
    });
  }


};

function extractUsernameFromChanges(changeStr) {
  const match = changeStr.match(/username\s*:\s*([^\|]+)/);
  return match ? match[1].trim() : '';
}

export const getAllOrderAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";
    const statusFilter = req.query.status || '';
    const notStatus = req.query.notStatus || '';
    const productId = req.query.productId || '';
    const type = req.query.type || '';
    const leadtype = req.query.leadtype || '';
    const lead = req.query.lead || null;
    const datetype = req.query.datetype || null;


    const overdue = req.query.overdue || ''; 
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;
    const userId = req.query.userId || null;

    const skip = (page - 1) * limit;

    const query = {};

     // if (startDate && endDate) {
    //   query.createdAt = { $gte: startDate, $lte: endDate };
    // } else if (startDate) {
    //   query.createdAt = { $gte: startDate };
    // } else if (endDate) {
    //   query.createdAt = { $lte: endDate };
    // }


    // Date range filtering based on PickupDate and ReturnDate
if (startDate && endDate && !datetype) {
  query.$and = [
    { PickupDate: { $lte: endDate } },
    { ReturnDate: { $gte: startDate } },
  ];
} else if (startDate) {
  query.ReturnDate = { $gte: startDate };
} else if (endDate) {
  query.PickupDate = { $lte: endDate };
}

  if (start && end && !datetype) {
      query.createdAt = { $gte: start, $lte: end };
    } else if (start) {
      query.createdAt = { $gte: start };
    } else if (end) {
      query.createdAt = { $lte: end };
    }

if (datetype && (start || end)) {
  const dateRange = {};
  if (start) dateRange.$gte = new Date(start);
  if (end) dateRange.$lte = new Date(end);

  if (datetype === '1') {
    // Lead Date (Ldate)
    query.Ldate = dateRange;
  } else if (datetype === '2') {
    // Created At
    query.createdAt = dateRange;
  } else if (datetype === '3') {
    // Follow-up Date
    query.date = dateRange;
  }
}

   
    

if (userId) {
  query.$or = [
    { userId: userId },
    { employeeId: userId },
    { employeeSaleId: userId }
  ];
}


    if (statusFilter.length > 0) {
      query.status = { $in: statusFilter.split(',').map(Number) };
    }

    if (notStatus.length > 0) {
      query.status = { $nin: notStatus.split(',').map(Number) };
    }

    if (overdue === 'true') {
      const targetDate = new Date(); // This will be 2025-05-01
      console.log('targetDate',targetDate)
      query.ReturnDate = { ...query.ReturnDate, $lt: targetDate }; // upcoming
      query.status = { $nin: 5 }; 
    }
 
    
    if (type.length > 0) {
      query.type = { $in: type.split(',').map(Number) };
    }
    if (leadtype) {
      query.leadType = leadtype;
    }else{
       query.$or = [
        { leadType: { $eq: 1 } },
        { leadType: { $exists: false } }
      ];
    }
    if (lead) {
      query.lead = lead;
    }

    if (productId) {
      query['addProduct._id'] = productId;
    }


    
    // Fetch with populate
    const allOrders = await orderModel
      .find(query)
      .sort({ _id: -1 })
      .populate({
        path: "userId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeSaleId",
        model: userModel,
        select: "username email phone",
      })
      .lean();

    // Filter manually for searchTerm
    const filteredOrders = allOrders.filter((order) => {
      if (!searchTerm) return true;

      const regex = new RegExp(searchTerm, 'i');
      return (
        regex.test(order.orderId?.toString()) ||
        regex.test(order.mode || '') ||
        regex.test(order.employeeId?.username || '') ||
        regex.test(order.employeeId?.email || '') ||
        regex.test(order.employeeId?.phone || '') ||
        regex.test(order.employeeSaleId?.username || '') ||
        regex.test(order.employeeSaleId?.email || '') ||
        regex.test(order.employeeSaleId?.phone || '') ||
        regex.test(order.userId?.phone || '') ||
        regex.test(order.userId?.username || '') ||
        regex.test(order.userId?.email || '')  
      )
    });

    const paginatedOrders = filteredOrders.slice(skip, skip + limit);

    if (paginatedOrders.length === 0) {
      return res.status(404).send({
        message: "No Order Found",
        success: false,
      });
    }

    // const enrichedOrders = paginatedOrders.map((order) => {
    //   const history = order.addHistory || [];
    //   const nurseMap = {};

    //   history.forEach((entry) => {
    //     const isNurseChange =
    //       entry.changes &&
    //       entry.changes.includes("Update Employee ( Doctor / Nurse / Runner )") &&
    //       entry.assignId;

    //     if (isNurseChange) {
    //       const key = entry.assignId;
    //       if (!nurseMap[key]) {
    //         nurseMap[key] = {
    //           assignId: entry.assignId,
    //           username: extractUsernameFromChanges(entry.changes), // helper function
    //           workDates: new Set(),
    //           email: '', // will fill below
    //         };
    //       }

    //       nurseMap[key].workDates.add(entry.date);
    //     }
    //   });

    //   const nurseStats = Object.values(nurseMap).map((nurse) => ({
    //     assignId: nurse.assignId,
    //     username: nurse.username,
    //     email: '', // Optional: populate if available in users
    //     totalDays: nurse.workDates.size,
    //     workDates: Array.from(nurse.workDates),
    //   }));

    //   return {
    //     ...order,
    //     NurseStats: nurseStats.length > 0 ? nurseStats : [],
    //   };
    // });

    const enrichedOrders = paginatedOrders.map((order) => {
  const history = order.addHistory || [];
  const nurseMap = {};

  history.forEach((entry) => {
    const isNurseChange =
      entry.changes &&
      entry.changes.includes("Update Employee ( Doctor / Nurse / Runner )") &&
      entry.assignId;

    if (isNurseChange) {
      const key = entry.assignId;
      if (!nurseMap[key]) {
        nurseMap[key] = {
          assignId: entry.assignId,
          username: extractUsernameFromChanges(entry.changes),
          workDates: new Set(),
          workingDays: new Set(),
          leaveDays: new Set(),
          leftDay: null,
          email: '',
        };
      }

      // Normalize date format if needed
      const date = entry.date;

      if (entry.working === "1") {
        nurseMap[key].workDates.add(date);
        nurseMap[key].workingDays.add(date);
      } else if (entry.working === "0") {
        nurseMap[key].workDates.add(date);
        nurseMap[key].leaveDays.add(date);
      } else if (entry.working === "2" && !nurseMap[key].leftDay) {
        nurseMap[key].leftDay = date;
      }
    }
  });

  const nurseStats = Object.values(nurseMap).map((nurse) => ({
    assignId: nurse.assignId,
    username: nurse.username,
    email: '',
    totalDays: nurse.workDates.size,
    workingDays: Array.from(nurse.workingDays),
    leaveDays: Array.from(nurse.leaveDays),
    leftDay: nurse.leftDay,
    workDates: Array.from(nurse.workDates),
  }));

  return {
    ...order,
    NurseStats: nurseStats.length > 0 ? nurseStats : [],
  };
});


    return res.status(200).send({
      message: "All Order list",
      Count: filteredOrders.length,
      currentPage: page,
      totalPages: Math.ceil(filteredOrders.length / limit),
      success: true,
      Order: enrichedOrders,
    });


    // return res.status(200).send({
    //   message: "All Order list",
    //   Count: paginatedOrders.length,
    //   currentPage: page,
    //   totalPages: Math.ceil(filteredOrders.length / limit),
    //   success: true,
    //   Order: paginatedOrders,
    // });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching Orders: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const getAllUserHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";
    const statusFilter = req.query.status || '';
    const notStatus = req.query.notStatus || '';
    const productId = req.query.productId || '';
    const type = req.query.type || '';
    const overdue = req.query.overdue || ''; 
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const skip = (page - 1) * limit;

    const query = {};

     // if (startDate && endDate) {
    //   query.createdAt = { $gte: startDate, $lte: endDate };
    // } else if (startDate) {
    //   query.createdAt = { $gte: startDate };
    // } else if (endDate) {
    //   query.createdAt = { $lte: endDate };
    // }


    // Date range filtering based on PickupDate and ReturnDate
if (startDate && endDate) {
  query.$and = [
    { PickupDate: { $lte: endDate } },
    { ReturnDate: { $gte: startDate } },
  ];
} else if (startDate) {
  query.ReturnDate = { $gte: startDate };
} else if (endDate) {
  query.PickupDate = { $lte: endDate };
}




    if (statusFilter.length > 0) {
      query.status = { $in: statusFilter.split(',').map(Number) };
    }

    if (notStatus.length > 0) {
      query.status = { $nin: notStatus.split(',').map(Number) };
    }

    if (overdue === 'true') {
      const targetDate = new Date(); // This will be 2025-05-01
      console.log('targetDate',targetDate)
      query.ReturnDate = { ...query.ReturnDate, $lt: targetDate }; // upcoming
      query.status = { $nin: 5 }; 
    }
 
    
    if (type.length > 0) {
      query.type = { $in: type.split(',').map(Number) };
    }

    if (productId) {
      query['addProduct._id'] = productId;
    }

    // Fetch with populate
    const allOrders = await orderModel
      .find(query)
      .sort({ _id: -1 })
      .populate({
        path: "userId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeSaleId",
        model: userModel,
        select: "username email phone",
      })
      .lean();

    // Filter manually for searchTerm
    const filteredOrders = allOrders.filter((order) => {
      if (!searchTerm) return true;

      const regex = new RegExp(searchTerm, 'i');
      return (
        regex.test(order.orderId?.toString()) ||
        regex.test(order.mode || '') ||
        regex.test(order.employeeId?.username || '') ||
        regex.test(order.employeeId?.email || '') ||
        regex.test(order.employeeId?.phone || '') ||
        regex.test(order.employeeSaleId?.username || '') ||
        regex.test(order.employeeSaleId?.email || '') ||
        regex.test(order.employeeSaleId?.phone || '') ||
        regex.test(order.userId?.phone || '') ||
        regex.test(order.userId?.username || '') ||
        regex.test(order.userId?.email || '')  
      )
    });

    const paginatedOrders = filteredOrders.slice(skip, skip + limit);

    if (paginatedOrders.length === 0) {
      return res.status(404).send({
        message: "No Order Found",
        success: false,
      });
    }

    return res.status(200).send({
      message: "All Order list",
      Count: paginatedOrders.length,
      currentPage: page,
      totalPages: Math.ceil(filteredOrders.length / limit),
      success: true,
      Order: paginatedOrders,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching Orders: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const getAllReportAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";
    const statusFilter = req.query.status || '';
    const notStatus = req.query.notStatus || '';
    const productId = req.query.productId || '';
    const type = req.query.type || '';
    const overdue = req.query.overdue || ''; 
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const skip = (page - 1) * limit;

    const query = {};

     // if (startDate && endDate) {
    //   query.createdAt = { $gte: startDate, $lte: endDate };
    // } else if (startDate) {
    //   query.createdAt = { $gte: startDate };
    // } else if (endDate) {
    //   query.createdAt = { $lte: endDate };
    // }


    // Date range filtering based on PickupDate and ReturnDate
if (startDate && endDate) {
  query.$and = [
    { PickupDate: { $lte: endDate } },
    { ReturnDate: { $gte: startDate } },
  ];
} else if (startDate) {
  query.ReturnDate = { $gte: startDate };
} else if (endDate) {
  query.PickupDate = { $lte: endDate };
}




    if (statusFilter.length > 0) {
      query.status = { $in: statusFilter.split(',').map(Number) };
    }

    if (notStatus.length > 0) {
      query.status = { $nin: notStatus.split(',').map(Number) };
    }

    if (overdue === 'true') {
      const targetDate = new Date(); // This will be 2025-05-01
      console.log('targetDate',targetDate)
      query.ReturnDate = { ...query.ReturnDate, $lt: targetDate }; // upcoming
      query.status = { $nin: 5 }; 
    }
 
    
    if (type.length > 0) {
      query.type = { $in: type.split(',').map(Number) };
    }

    if (productId) {
      query['addProduct._id'] = productId;
    }

    // Fetch with populate
    const allOrders = await orderModel
      .find(query)
      .sort({ _id: -1 })
      .populate({
        path: "userId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeId",
        model: userModel,
        select: "username email phone",
      })
      .populate({
        path: "employeeSaleId",
        model: userModel,
        select: "username email phone",
      })
      .lean();

    // Filter manually for searchTerm
    const filteredOrders = allOrders.filter((order) => {
      if (!searchTerm) return true;

      const regex = new RegExp(searchTerm, 'i');
      return (
        regex.test(order.orderId?.toString()) ||
        regex.test(order.mode || '') ||
        regex.test(order.employeeId?.username || '') ||
        regex.test(order.employeeId?.email || '') ||
        regex.test(order.employeeId?.phone || '') ||
        regex.test(order.employeeSaleId?.username || '') ||
        regex.test(order.employeeSaleId?.email || '') ||
        regex.test(order.employeeSaleId?.phone || '') ||
        regex.test(order.userId?.phone || '') ||
        regex.test(order.userId?.username || '') ||
        regex.test(order.userId?.email || '')  
      )
    });

    const paginatedOrders = filteredOrders.slice(skip, skip + limit);

    if (paginatedOrders.length === 0) {
      return res.status(404).send({
        message: "No Order Found",
        success: false,
      });
    }

    return res.status(200).send({
      message: "All Order list",
      Count: paginatedOrders.length,
      currentPage: page,
      totalPages: Math.ceil(filteredOrders.length / limit),
      success: true,
      Order: paginatedOrders,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching Orders: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const editFullOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      order, discount,subtotal,shipping,applyIGST,applyCGST,applySGST,finalTotal,taxTotal,  addRental,addReceived,addReturn,addProduct,
      userId,UserDetails,employeeSaleId,PickupDate,ReturnDate,SecurityAmt,AdvanceAmt,employeeId,OnBoardDate,addHistory,dutyHr
    } = req.body;

    const orderUpdate = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!orderUpdate) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    } 
 
   
    let updateFields = {
      type: order,
      userId,
      UserDetails,
      employeeSaleId,
      employeeId,
      PickupDate,ReturnDate,SecurityAmt,AdvanceAmt,
       addRental,
       addReceived,
       addReturn,
       addProduct,
       discount,
       subtotal,
       shipping,
       applyIGST,
       applyCGST,
       applySGST,
       totalAmount: finalTotal,
       taxTotal,  
        addHistory,
       dutyHr
    };

    // Only include OnBoardDate if it's a valid date
if (OnBoardDate && !isNaN(Date.parse(OnBoardDate))) {
  updateFields.OnBoardDate = new Date(OnBoardDate);
}

    // Only include OnBoardDate if it's a valid date
if (OnBoardDate && !isNaN(Date.parse(OnBoardDate))) {
  updateFields.OnBoardDate = new Date(OnBoardDate);
}


    const updatedOrder = await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).populate('employeeId' , 'phone username').populate('userId' ,  'phone username');



    return res.status(200).json({
            message: "Order Updated!",
            success: true,
          });

  } catch (error) {
    console.log('error',error)
    return res.status(500).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const editFullLeadAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,order, discount,subtotal,shipping,applyIGST,applyCGST,applySGST,finalTotal,taxTotal,  addRental,addReceived,addReturn,addProduct,
      userId,UserDetails,employeeSaleId,PickupDate,ReturnDate,SecurityAmt,AdvanceAmt,employeeId,OnBoardDate,addHistory,dutyHr,date,time,comment
      ,requirement,Ldate,
Ltime,
product,
source,history
    } = req.body;

    const orderUpdate = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!orderUpdate) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    } 
 
   
    let updateFields = {
       type, 
      UserDetails,
      employeeSaleId, 
        date,
        time,
        comment,
        requirement,
       leadHistory : history || [],
       Ldate,
Ltime,
product,
source

    };

 

    await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
 

    return res.status(200).json({
            message: "Lead Updated!",
            success: true,
          });

  } catch (error) {
    console.log('error',error)
    return res.status(500).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const editOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    console.log('status',status)
    
    // const user = order.userId[0]; // Assuming there's only one user associated with the order

    // const { email, username, _id } = user; // Extract user email
  // Loop through the products in the order and add 1 to their stock
  if (status === "4") {

  for (let product of order.addProduct ) {
    // Retrieve the product details
    const productDetails = await productModel.findById(product._id);

    if (!productDetails) {
      console.log(`Product not found: ${product._id}`);
      continue; // Skip if product is not found
    }

     if(order.type !== 1){

   // Add 1 to the stock of each product
    const updatedStock = productDetails.reStock + 1;

    // Update the stock for the product
    productDetails.reStock = updatedStock;

    // Save the updated product
    await productDetails.save();
    console.log(`Added 1 stock for product ${product.title}: ${updatedStock}`);

    }
 
  }
}

 if (status === 10) {
 
  let updateFields = {
      leadType:1,
      lead:1,
    };

  const neworder = await orderModel.findById(id).populate('employeeId', 'phone username')
 
     // Calculate the auto-increment ID
        const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
        let order_id;
    
        if (lastOrder) {
          // Convert lastOrder.orderId to a number before adding 1
          const lastOrderId = parseInt(lastOrder.orderId);
          order_id = lastOrderId + 1;
        } else {
          order_id = 1;
        } 


const userDetails = neworder?.UserDetails[0];
console.log('userDetails',userDetails)
if (userDetails) {
  // Step 1: Try to find an existing user by phone
  const existingUser = await userModel.findOne({ phone: userDetails.phone });

  // Step 2: If user not found, create a new one
  if (!existingUser) {
    const newUser = new userModel({
      username: userDetails.name,
      phone: userDetails.phone,
      email: userDetails.email,
      address: userDetails.address,
      gender: userDetails.gender,
      type: 2,
      company: userDetails.company,
      companyName: userDetails.companyName,
      companyGST: userDetails.companyGST,
      companyAddress: userDetails.companyAddress,
      age: userDetails.age,
      weight: userDetails.weight
    });

     
    updateFields = {
      orderId:order_id,
      leadType:1,
      userId: newUser._id,
      lead:1,
    };

 await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    await newUser.save();
  }else{

     updateFields = {
      orderId:order_id,
      leadType:1,
      userId: existingUser._id,
      lead:1,
    };

 await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

}
}



   return res.status(200).json({
            message: "Order Updated!",
            success: true,
          });


} 
    let updateFields = {
      status,
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).populate('employeeId', 'phone username')
.populate('userId', 'phone username');

    
if(updatedOrder.status === 2){

  const UserPhone = updatedOrder.UserDetails[0].phone;
 const productNames = Array.isArray(updatedOrder.addProduct)
  ? updatedOrder.addProduct.map(p => p.title || "Unnamed Product").join(", ")
  : "No products added";

      const notificationData = {
                    mobile: `91${UserPhone}`,
                    templateid: "1768237167456216",
                    overridebot: "yes",
                    template: {
                      components: [ 
                        {
                          type: "body",
                          parameters: [
                            { type: "text", text: updatedOrder.orderId },
                            { type: "text", text: productNames },
                            { type: "text", text: updatedOrder.ReturnDate
    ? new Date(updatedOrder.ReturnDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date" },
                          ],
                        },
                      ],
                    },
                  };
        
                  try {
                    await axios.post(process.env.WHATSAPPAPI, notificationData, {
                      headers: {
                        "API-KEY": process.env.WHATSAPPKEY,
                        "Content-Type": "application/json",
                      },
                    });
                    console.log(`WhatsApp reminder sent to ${UserPhone}`);
                  } catch (err) {
                    console.error(`WhatsApp failed for ${UserPhone}:`, err.message);
                  }


}
 
if(updatedOrder.status === 4){

  const UserPhone = updatedOrder.UserDetails[0].phone;
 const productNames = Array.isArray(updatedOrder.addProduct)
  ? updatedOrder.addProduct.map(p => p.title || "Unnamed Product").join(", ")
  : "No products added";

      const notificationData = {
                    mobile: `91${UserPhone}`,
                    templateid: "1917609362388437",
                    overridebot: "yes",
                    template: {
                      components: [ 
                        {
                          type: "body",
                          parameters: [
                            { type: "text", text: updatedOrder.orderId },
                             { type: "text", text: updatedOrder.ReturnDate
    ? new Date(updatedOrder.ReturnDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date" },
                            { type: "text", text: productNames },
                            { type: "text", text: updatedOrder.totalAmount },
                           
                          ],
                        },
                      ],
                    },
                  };
        
                  try {
                    await axios.post(process.env.WHATSAPPAPI, notificationData, {
                      headers: {
                        "API-KEY": process.env.WHATSAPPKEY,
                        "Content-Type": "application/json",
                      },
                    });
                    console.log(`WhatsApp reminder sent to ${UserPhone}`);
                  } catch (err) {
                    console.error(`WhatsApp failed for ${UserPhone}:`, err.message);
                  } 
}
 

if(updatedOrder.type === 4 && updatedOrder.status == 1){

  function getDaysBetween(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))+ 1;
}

const days = getDaysBetween(updatedOrder.PickupDate, updatedOrder.ReturnDate);

console.log('updatedOrder.employeeId?.phone',updatedOrder.employeeId?.phone);

if (!updatedOrder.employeeId?.phone || !updatedOrder.employeeId?.username || !updatedOrder.UserDetails[0]?.name) {
  console.log('updatedOrder',updatedOrder)
  console.error('Missing required fields for WhatsApp message');
  return;
}

const notificationData = {
                  mobile: `91${updatedOrder.UserDetails[0]?.phone

                  }`,
                  templateid: "677048628440397",
                  overridebot: "yes/no",
                  template: {
                    components: [ 
                      {
                        type: "body",
                        parameters: [
                          { type: "text", text: updatedOrder.UserDetails[0]?.name || 'NA' },
                          { type: "text", text: updatedOrder.orderId || 'NA'  },
                          { type: "text", text:  updatedOrder.employeeId.username || 'NA'},
                           { type: "text", text: updatedOrder.PickupDate
    ? new Date(updatedOrder.PickupDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date"},
                          { type: "text", text: days || 'NA' },
                         ],
                      },
                    ],
                  },
                };
      
                try {
                  await axios.post(process.env.WHATSAPPAPI, notificationData, {
                    headers: {
                      "API-KEY": process.env.WHATSAPPKEY,
                      "Content-Type": "application/json",
                    },
                  });
                  console.log(`WhatsApp sent to ${updatedOrder.employeeId.phone}`);
                } catch (err) {
                  console.error(`WhatsApp failed for ${updatedOrder.employeeId.phone}:`, err.message);
                }
}


if(updatedOrder.type === 4 && updatedOrder.status == 1){

  function getDaysBetween(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))+ 1;
}

const days = getDaysBetween(updatedOrder.PickupDate, updatedOrder.ReturnDate);

console.log('updatedOrder.employeeId?.phone',updatedOrder.employeeId?.phone);

if (!updatedOrder.employeeId?.phone || !updatedOrder.employeeId?.username || !updatedOrder.UserDetails[0]?.name) {
  console.log('updatedOrder',updatedOrder)
  console.error('Missing required fields for WhatsApp message');
  return;
}

const notificationData = {
                  mobile: `91${updatedOrder.employeeId?.phone}`,
                  templateid: "715611274694613",
                  overridebot: "yes/no",
                  template: {
                    components: [ 
                      {
                        type: "body",
                        parameters: [
                          { type: "text", text: updatedOrder.employeeId.username || 'NA' },
                          { type: "text", text: updatedOrder.orderId || 'NA'  },
                          { type: "text", text: updatedOrder.UserDetails[0]?.name || 'NA'},
                          { type: "text", text: updatedOrder.UserDetails[0]?.address || 'NA' },
                          { type: "text", text: updatedOrder.PickupDate
    ? new Date(updatedOrder.PickupDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date"},
                          { type: "text", text: days || 'NA' },
                          { type: "text", text: updatedOrder.UserDetails[0]?.phone || 'NA' },
                        ],
                      },
                    ],
                  },
                };
      
                try {
                  await axios.post(process.env.WHATSAPPAPI, notificationData, {
                    headers: {
                      "API-KEY": process.env.WHATSAPPKEY,
                      "Content-Type": "application/json",
                    },
                  });
                  console.log(`WhatsApp sent to ${updatedOrder.employeeId.phone}`);
                } catch (err) {
                  console.error(`WhatsApp failed for ${updatedOrder.employeeId.phone}:`, err.message);
                }
      }

    return res.status(200).json({
            message: "Order Updated!",
            success: true,
          });

  } catch (error) {
    console.log('error',error)
    return res.status(500).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const editOrderAdmin_old = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    const { email, username } = order.userId; // Extract user email

    let updateFields = {
      status,
    };

    await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      }
    });


    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      subject: 'Order Confirmation',
      html: `
          <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
     <div class="modal d-block" style="
        width: 500px;
        background: white;
        padding: 20px;
        margin: auto;
        border: 2px solid #8080802e;
        border-radius: 10px;
    ">
      <div class="modal-dialog">
        <div class="modal-content" style="
        text-align: center;
    ">
          <div class="modal-header">
    <h1 style="color:black;"> Cayro Shop <h1>
          </div>
          <div class="modal-body text-center">
            <h5 style="
        margin: 0px;
        margin-top: 14px;
        font-size: 20px;color:black;
    "> Order Id : #${order.orderId} </h5>
           <p style="color:black;" >Hey ${username},</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
           <h2 style="color:black;"> Your Order Is ${status === '1' ? 'Placed' :
          status === '2' ? 'Accepted' :
            status === '3' ? 'Packed' :
              status === '4' ? 'Shipped' :
                status === '5' ? 'Delivered' :
                  'Unknown'
        }! </h2>
         
           <p style="color:black;" > We'll send you a shipping confirmation email
    as soon as your order ${status === '1' ? 'Placed' :
          status === '2' ? 'Accepted' :
            status === '3' ? 'Packed' :
              status === '4' ? 'Shipped' :
                status === '5' ? 'Delivered' :
                  'Unknown'
        }. </p>
          </div>
          <div class="modal-footer">
      
            <a href="https://cayroshop.com/" style="
        background: green;
        color: white;
        padding: 10px;
        display: block;
        margin: auto;
        border-radius: 6px;
        text-decoration: none;
    "> Track Order</a>
          </div>
        </div>
      </div>
    </div> </div>
          `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send email');
      } else {
        return res.status(200).json({
          message: "Order Updated!",
          success: true,
        });
      }
    });

  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const getAllUserAdmin_old = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const empType = req.query.empType || null; 
    const type = req.query.type || null; 
    const active = req.query.active || null; 
     const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { username: regex },
        { email: regex },
        { phone: regex },  
        { pincode: regex },
        { address: regex }  
      ];
    }

    if(type){
      query.type = type;
    }
    
     if(empType){
      query.empType = empType;
    }

    const totalUser = await userModel.countDocuments(query); // Count total documents matching the query

    const users = await userModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!users || users.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No users found",
        success: false,
      });
    }

     // Check availability for each user
    const usersWithAvailability = await Promise.all(
      users.map(async (user) => {
        const isBusy = await orderModel.exists({
          type: 4,
          employeeId: user._id,
          status: { $nin: [4, 5] }, // Not 4 or 5
        });

        return {
          ...user,
          available: isBusy ? 0 : 1, // 0 = busy, 1 = available
        };
      })
    );


    return res.status(200).send({ // Send successful response
      message: "All user list",
      userCount: users.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      users: usersWithAvailability,
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting users: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const getAllUserAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";
    const empType = req.query.empType || null;
    const type = req.query.type || null;
    const active = req.query.active || null;
    const username = req.query.name || null;
    const phone = req.query.phone || null;
    const state = req.query.state || null;
    const city = req.query.city || null;
    const pincode = req.query.pincode || null;
    const location = req.query.location || null;
    const nurseParam = req.query.nurse || null;

 

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      query.$or = [
        { username: regex },
        { email: regex },
        { phone: regex },
        { pincode: regex },
        { address: regex },
      ];
    }

    if(username) query.username = username;
     if(phone) query.phone = phone;
     if(state) query.state = state;
     if(city) query.city = city;
     if(pincode) query.pincode = pincode;
     if(location) query.location = location;

    if (type) query.type = type;
    if (empType) query.empType = empType;

 if (nurseParam) {
  let nurseIds = [];

  if (typeof nurseParam === "string") {
    nurseIds = nurseParam.split(",");
  } else if (Array.isArray(nurseParam)) {
    nurseIds = nurseParam;
  }
 
    const objectIds = nurseIds
      .filter(id => mongoose.Types.ObjectId.isValid(id)) // ✅ only valid ones
      .map(id => new mongoose.Types.ObjectId(id));

    if (objectIds.length > 0) {
      query.nurse = { $in: objectIds }; // ✅ match at least one
    }
 
}

    // Get all matching users (no pagination yet)
    let allUsers = await userModel.find(query).sort({ _id: -1 }).lean();

    // if (!allUsers || allUsers.length === 0) {
    //   return res.status(404).send({
    //     message: "No users found",
    //     success: false,
    //   });
    // }

    // Compute availability
    let usersWithAvailability = await Promise.all(
      allUsers.map(async (user) => {
        const isBusy = await orderModel.exists({
          type: 4,
          employeeId: user._id,
          status: { $nin: [4, 5] },
        });

        return {
          ...user,
          available: isBusy ? 0 : 1,
        };
      })
    );

    // Filter by availability if 'active' param is provided
    if (active === "1") {
      usersWithAvailability = usersWithAvailability.filter(u => u.available === 1);
    } else if (active === "0") {
      usersWithAvailability = usersWithAvailability.filter(u => u.available === 0);
    }

    const totalUser = usersWithAvailability.length;

    // Paginate after availability filtering
    const start = (page - 1) * limit;
    const paginatedUsers = usersWithAvailability.slice(start, start + limit);

    return res.status(200).send({
      message: "All user list",
      userCount: paginatedUsers.length,
      totalUsers: totalUser,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      users: paginatedUsers,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting users: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const editUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      status,
    };

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!user) {
      return res.status(200).send({
        message: "NO User found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating User: ${error}`,
      success: false,
      error,
    });
  }
};

export const getUserIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const User = await userModel.findById(id);
 
        // Find all orders where addHistory.assignId matches the user ID
        const orders = await orderModel.find({ 'addHistory.assignId': id });
    
        // Extract relevant history entries from matching orders
        const matchedHistories = orders.flatMap(order =>
          order.addHistory.filter(entry => entry.assignId === id)
        );
    


    if (!User) {
      return res.status(200).send({
        message: "User Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single User!",
      success: true,
      User,
      history: matchedHistories, 

    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get User : ${error}`,
      success: false,
      error,
    });
  }
};

export const getUserIdHistoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const User = await userModel.findById(id);
 
        // Find all orders where addHistory.assignId matches the user ID
        const orders = await orderModel.find({ 'addHistory.assignId': id });
    
     const matchedHistories = orders.flatMap(order =>
  order.addHistory
    .filter(entry => entry.assignId === id)
    .map(entry => ({
      ...entry,
      status: order.status,
      orderId: order.orderId,
    }))
);


    if (!User) {
      return res.status(200).send({
        message: "User Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single User!",
      success: true,
      User,
      history: matchedHistories, 

    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get User : ${error}`,
      success: false,
      error,
    });
  }
};


// for folder logic 

export const AddAdminFolderController = async (req, res) => {
  try {
    const { id } = req.query; // Access id from query parameters
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide Folder name",
      });
    }

    let newFolder;
    if (id) {
      // Create a new category with the specified parent
      newFolder = new folderModel({ name, folderId: id });
    } else {
      // Create a new category without a parent
      newFolder = new folderModel({ name });
    }

    await newFolder.save();

    return res.status(201).send({
      success: true,
      message: "Folder Created!",
      newFolder,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      // Duplicate key error, i.e., folder name already exists
      return res.status(400).send({
        success: false,
        message: "Folder name already exists. Please choose a different name.",
      });
    }
    console.error("Error while creating Folder:", error);
    return res.status(500).send({
      success: false,
      message: "Error while creating Folder",
      error,
    });
  }
};


export const GetFolderIDAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await folderModel.findById(id);
    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Folder found by ID",
      success: true,
      folder,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error while getting folder: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};


export const GetFolderAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // If id is provided, fetch both parent and child folders
      const [parentFolder, Folder] = await Promise.all([
        folderModel.findById(id).lean(), // Fetch parent folder
        folderModel.find({ folderId: id }).lean(), // Fetch child folders
      ]);

      const userId = req.params.id;



      if (!parentFolder) {
        return res.status(404).send({
          message: "Parent Folder not found",
          success: false,
        });
      }

      return res.status(200).send({
        message: "Parent and Child Folders found",
        success: true,
        parentFolder,
        Folder,
      });
    } else {
      // If id is not provided, fetch folders where folderId is empty
      const Folder = await folderModel.find({ folderId: null }).lean();

      return res.status(200).send({
        message: "Folders without Parent found",
        success: true,
        Folder,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting folders ${error}`,
      success: false,
      error,
    });
  }
};



export const GetImageAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {

      // Find galleryModel items for the specified user ID
      const Gallery = await galleryModel.find({ folderId: id }).lean();

      if (!Gallery) {
        return res.status(404).send({
          message: "Images not found",
          success: false,
        });
      }

      return res.status(200).send({
        message: "images found by Id",
        success: true,
        Gallery,
      });
    } else {
      // If id is not provided, fetch folders where folderId is empty
      const Gallery = await galleryModel.find({ folderId: null }).lean();

      return res.status(200).send({
        message: "All images found",
        success: true,
        Gallery,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting images ${error}`,
      success: false,
      error,
    });
  }
};




export const UpdateFolderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folderId } = req.body;

    // Validation: Check if the name is empty
    if (!name || /^\s*$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check if the name already exists for another folder
    const existingFolder = await folderModel.findOne({ name });
    if (existingFolder && existingFolder._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Folder name already exists. Please choose a different name.",
      });
    }

    let updateFields = {
      name,
      folderId,
    };

    const Folder = await folderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!Folder) {
      return res.status(404).json({
        message: "Folder not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Folder updated successfully!",
      success: true,
      Folder,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error while updating Folder: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const deleteFolderAdmin = async (req, res) => {
  try {
    await folderModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Folder Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Folder",
      error,
    });
  }
};


// for zones

export const AddAdminZonesController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newZones = new zonesModel({
      name,
      status,
    });
    await newZones.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Zones!",
      newZones,
    });
  } catch (error) {
    console.error("Error while creating Zones:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Zones",
      error,
    });
  }
};

export const getAllZonesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { username: regex },
        { email: regex },
        { phone: regex } // Add phone number search if needed
      ];
    }

    const totalUser = await zonesModel.countDocuments(query); // Count total documents matching the query

    const zones = await zonesModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!zones || zones.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No zones found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All zones list",
      Count: zones.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      zones, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting zones: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const updateZonesAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, cities, primary } = req.body;

    console.log("primary", primary);

    // Check if primary is set to "true"
    if (primary === true) {
      // Query to check if any items in zonesModel have primary === 'true'
      const existingPrimaryZone = await zonesModel.findOne({ primary: "true" });

      // If existingPrimaryZone is found, it means primary is already set to 'true'
      if (existingPrimaryZone) {
        return res.status(400).json({
          message: "Zones primary already set!",
          success: false,
        });
      }
    }

    // Update fields
    const updateFields = { name, status, primary, cities };

    // Update the zone
    const updatedZone = await zonesModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Zones Updated!",
      success: true,
      zone: updatedZone,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Zones: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};



export const getZonesIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Zones = await zonesModel.findById(id);
    if (!Zones) {
      return res.status(200).send({
        message: "Zones Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Zones!",
      success: true,
      Zones,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Zones: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteZonesAdmin = async (req, res) => {
  try {
    await zonesModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Zone Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Zone",
      error,
    });
  }
};

export const ViewAllAdminZones = async (req, res) => {

  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({});

    res.status(200).json({ success: true, Zones });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}


// for tax 

export const AddAdminTaxController = async (req, res) => {
  try {
    const { name, rate, type, zoneId, status } = req.body;

    // Validation
    if (!name || !rate || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newTax = new taxModel({
      name, rate, type, zoneId, status
    });
    await newTax.save();

    return res.status(201).send({
      success: true,
      message: "Tax created!",
      newTax,
    });
  } catch (error) {
    console.error("Error while creating Tax:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Tax",
      error,
    });
  }
};

export const getAllTaxAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalUser = await taxModel.countDocuments(query); // Count total documents matching the query

    const Tax = await taxModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Tax || Tax.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All tax list",
      Count: Tax.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Tax, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updateTaxAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, zoneId, status } = req.body;

    let updateFields = {
      name, rate, type, zoneId, status
    };

    const Tax = await taxModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Tax Updated!",
      success: true,
      Tax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Tax: ${error}`,
      success: false,
      error,
    });
  }
};

export const getTaxIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Tax = await taxModel.findById(id);
    if (!Tax) {
      return res.status(200).send({
        message: "Tax Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Tax!",
      success: true,
      Tax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Tax: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteTaxAdmin = async (req, res) => {
  try {
    await taxModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Tax Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};

// for promo code 

export const AddAdminPromoController = async (req, res) => {
  try {
    const { name, rate, type, status } = req.body;

    // Validation
    if (!name || !rate || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newPromo = new promoModel({
      name, rate, type, status
    });
    await newPromo.save();

    return res.status(201).send({
      success: true,
      message: "Promo code created!",
      newPromo,
    });
  } catch (error) {
    console.error("Error while creating Promo code:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};

export const getAllPromoAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalUser = await promoModel.countDocuments(query); // Count total documents matching the query

    const Promo = await promoModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Promo || Promo.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax Promo code",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Promo list",
      Count: Promo.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Promo, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePromoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name, rate, type, status
    };

    const Promo = await promoModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Promo code Updated!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const getPromoIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Promo = await promoModel.findById(id);
    if (!Promo) {
      return res.status(200).send({
        message: "Promo code Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Promo code!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const deletePromoAdmin = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Promo code Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};


export const deleteOrderAdmin = async (req, res) => {
  try {
    await orderModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Order Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Order",
      error,
    });
  }
};

// for pages 


export const AddAdminPageController = async (req, res) => {
  try {
    const { title, description, metaTitle, metaDescription, metaKeywords } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newPage = new pageModel({
      title, description, metaTitle, metaDescription, metaKeywords
    });
    await newPage.save();

    return res.status(201).send({
      success: true,
      message: "Page created!",
      newPage,
    });
  } catch (error) {
    console.error("Error while creating Page:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};


export const getAllPageAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { title: regex },
        // { description: regex },
      ];
    }

    const totalUser = await pageModel.countDocuments(query); // Count total documents matching the query

    const Mpage = await pageModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Mpage || Mpage.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Page found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Page list",
      Count: Mpage.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Mpage, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Page: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePageAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, metaTitle, metaDescription, metaKeywords,type
    } = req.body;

    let updateFields = {
      title, description, metaTitle, metaDescription, metaKeywords,type
    };

    const MPage = await pageModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Page Updated!",
      success: true,
      MPage,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Page: ${error}`,
      success: false,
      error,
    });
  }
};

export const getPageIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Mpage = await pageModel.findById(id);
    if (!Mpage) {
      return res.status(200).send({
        message: "Page not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Page!",
      success: true,
      Mpage,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Page: ${error}`,
      success: false,
      error,
    });
  }
};

export const deletePageAdmin = async (req, res) => {
  try {
    await pageModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Page Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr While Deleteing Page",
      error,
    });
  }
};


// for Product Varients





export const getAllproductVarientAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalCount = await productVarientModel.countDocuments(query); // Count total documents matching the query

    const productVarient = await productVarientModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!productVarient || productVarient.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax Promo code",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Product Varient list",
      Count: productVarient.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      productVarient, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updateproductVarientAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name, rate, type, status
    };

    const Promo = await productVarient.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Promo code Updated!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const getproductVarientIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Promo = await promoModel.findById(id);
    if (!Promo) {
      return res.status(200).send({
        message: "Promo code Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Promo code!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteproductVarientAdmin = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Promo code Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};



export const exportAllProAdmin = async (req, res) => {

  try {
    // Fetch data from the database (assuming using Mongoose)
    //   const products = await productModel.find({}, 'title description pImage images slug regularPrice salePrice status stock Category weight tag').lean();
    const products = await productModel.find({}, 'p_id title description Category pImage  images slug regularPrice salePrice status stock weight gst hsn sku specifications variations  metaTitle metaDescription metaKeywords ').lean();

    const filename = 'all_products.csv';

    // Stringify the product data
    stringify(products, { header: true }, (err, csvString) => {
      if (err) {
        console.error('Error generating CSV:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Set response headers
      res.header('Content-Type', 'text/csv');
      res.attachment(filename);

      // Send CSV data
      res.send(csvString);

    });
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).send('Internal Server Error');
  }

};

// export const importAllProAdmin = async (req, res) => {
//   try {
//     const jsonData = req.body;

//     if (!jsonData || !Array.isArray(jsonData)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid JSON data provided'
//       });
//     }

//     // Process the parsed JSON data
//     for (const productData of jsonData) {
//       try {
//         // Ensure that p_id is present and not 'new'
//         if (productData.p_id !== undefined && productData.p_id !== 'new') {
//           // Convert p_id to a number if it's numeric
//           if (!isNaN(productData.p_id)) {
//             productData.p_id = parseFloat(productData.p_id);
//           }

//           // Check if the product already exists by p_id
//           const existingProduct = await productModel.findOne({ p_id: productData.p_id }).lean();

//           if (existingProduct) {
//             // Update existing product
//             // Convert regularPrice and salePrice to numbers if they are strings
//             if (typeof productData.regularPrice === 'string') {
//               productData.regularPrice = parseFloat(productData.regularPrice);
//             }
//             if (typeof productData.salePrice === 'string') {
//               productData.salePrice = parseFloat(productData.salePrice);
//             }
//             if (typeof productData.status === 'string') {
//               productData.status = productData.status.toLowerCase();
//             }
//             await productModel.findOneAndUpdate({ p_id: productData.p_id }, productData);
//           }
//         } else {

//           for (const key in productData) {
//             if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
//               newProductData[key] = productData[key];
//             }
//           }

//           // Convert regularPrice and salePrice to numbers if they are strings
//           if (typeof newProductData.regularPrice === 'string') {
//             newProductData.regularPrice = parseFloat(newProductData.regularPrice);
//           }
//           if (typeof newProductData.salePrice === 'string') {
//             newProductData.salePrice = parseFloat(newProductData.salePrice);
//           }

//           // Create the new product
//           await productModel.create(newProductData);
//         }
//       } catch (error) {
//         console.error('Error importing product:', error);
//         // Log the error and proceed to the next product
//       }
//     }

//     console.log('Products imported successfully');
//     return res.status(200).json({
//       success: true,
//       message: 'Products imported successfully'
//     });

//   } catch (error) {
//     console.error('Error importing products:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error while importing products',
//       error: error.message
//     });
//   }
// };



export const importAllProAdmin = async (req, res) => {
  try {
    const jsonData = req.body;

    if (!jsonData || !Array.isArray(jsonData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON data provided'
      });
    }

    try {
      // Process the parsed JSON data
      for (const productData of jsonData) {

        if (productData.p_id !== undefined) {

          if (!isNaN(productData.p_id)) {
            productData.p_id = parseFloat(productData.p_id);
          }
          if (productData.p_id !== 'new') {
            try {
              // Check if the product already exists
              const existingProduct = await productModel.findOne({ p_id: productData.p_id }).lean();
              if (existingProduct) {

                if (typeof productData.regularPrice === 'string') {
                  productData.regularPrice = parseFloat(productData.regularPrice);
                }
                if (typeof productData.salePrice === 'string') {
                  productData.salePrice = parseFloat(productData.salePrice);
                }
                if (typeof productData.status === 'string') {
                  productData.status = productData.status.toLowerCase();
                }
                await productModel.findOneAndUpdate({ p_id: productData.p_id }, productData);

              }

            } catch (error) {
              console.error('Error importing product:', error);
            }
          } else { }

          if (productData.p_id === 'new') {

            const lastProduct = await productModel.findOne().sort({ _id: -1 }).limit(1);
            if (typeof lastProduct.p_id === 'string') {
              lastProduct.p_id = parseFloat(lastProduct.p_id);
            }

            const lastProductId = lastProduct ? lastProduct.p_id : 0;

            // Calculate the auto-increment ID
            const pro_id = lastProductId + 1;


            try {

              if (typeof productData.regularPrice === 'string') {
                productData.regularPrice = parseFloat(productData.regularPrice);
              }
              if (typeof productData.salePrice === 'string') {
                productData.salePrice = parseFloat(productData.salePrice);
              }
              if (typeof productData.status === 'string') {
                productData.status = productData.status.toLowerCase();
              }


              const {
                title,
                description,
                pImage,
                images,
                slug,
                regularPrice,
                salePrice,
                status,
                stock,
                weight,
                Category,
                gst,
                hsn,
                sku,
                variations,
                metaTitle,
                metaDescription,
                metaKeywords
              } = productData;

              const newProduct = new productModel({
                p_id: pro_id,
                title,
                description,
                pImage,
                images,
                slug,
                regularPrice,
                salePrice,
                status,
                stock,
                weight,
                Category,
                gst,
                hsn,
                sku,
                variations,
                metaTitle,
                metaDescription,
                metaKeywords
              });


              // Save the product to the database
              await newProduct.save();

            } catch (error) {
              console.error('Error importing product:', error);
            }

          }


          console.log(productData.p_id)

        }

      }

      console.log('Products imported successfully');
      return res.status(200).json({
        success: true,
        message: 'Products imported successfully'
      });

    } catch (error) {
      console.error('Error importing products:', error);
      return res.status(500).json({
        success: false,
        message: 'Error while importing products',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Error importing products:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while importing products',
      error: error.message
    });
  }
};

// Add Plan Category

export const AddPlanCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name Field",
      });
    }

    // Create a new category with the specified parent
    const planCategory = new planCategoryModel({
      name
    });
    await planCategory.save();

    return res.status(201).send({
      success: true,
      message: "Plan category created!",
      planCategory,
    });
  } catch (error) {
    console.error("Error while creating plan category:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};

export const getAllPlanCategoryAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalCount = await planCategoryModel.countDocuments(query); // Count total documents matching the query

    const planCategory = await planCategoryModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!planCategory || planCategory.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan Category",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan Category list",
      Count: planCategory.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      planCategory, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const deletePlanCategoryAdmin = async (req, res) => {
  try {
    await planCategoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Plan Catgeory Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr while deleteing",
      error,
    });
  }
};

// Add Plan

export const AddPlanController = async (req, res) => {
  try {
    const { name, price, Category } = req.body;

    // Validation



    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name Field",
      });
    }

    // Create a new category with the specified parent
    const plan = new planModel({
      name, price, Category
    });
    await plan.save();

    return res.status(201).send({
      success: true,
      message: "Plan created!",
      plan,
    });
  } catch (error) {
    console.error("Error while creating plan:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating plan",
      error,
    });
  }
};

export const getAllPlanAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { price: regex },
      ];
    }

    const totalCount = await planModel.countDocuments(query); // Count total documents matching the query

    const plan = await planModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      Count: plan.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      plan, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePlanAdmin = async (req, res) => {
  const { name, price, Category, validity } = req.body;
  console.log('Category', Category);

  try {
    const { id } = req.params;
    let updateFields = {
      name, price, Category, validity
    };

    const plan = await planModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Plan Updated!",
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating plan: ${error}`,
      success: false,
      error,
    });
  }
};

export const getPlanIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await planModel.findById(id);
    if (!plan) {
      return res.status(200).send({
        message: "plan Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single plan!",
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get plan: ${error}`,
      success: false,
      error,
    });
  }
};

export const deletePlanAdmin = async (req, res) => {
  try {
    await planModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Plan Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr while deleteing",
      error,
    });
  }
};


export const UserloginAll = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const admin = await userModel.findOne({ email });
    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "email is not registerd",
        admin,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        admin,
      });
    }

    return res.status(200).send({
      success: true,
      message: "login sucesssfully",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      success: false,
      error,
    });
  }
};


// for department model

export const AddAdminDepartmentController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new departmentsModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Department Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Department:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Department",
      error,
    });
  }
};

export const getAllDepartmentFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await departmentsModel.countDocuments();

    const Department = await departmentsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateDepartmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await departmentsModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Department Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const getDepartmentIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await departmentsModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Department Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Department!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteDepartmentAdmin = async (req, res) => {
  try {
    await departmentsModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Department Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Department",
      error,
    });
  }
};

// for nurse department model

export const AddAdminNurseDepartmentController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new nurseDepartmentsModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Department Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Department:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Department",
      error,
    });
  }
};

export const getAllNurseDepartmentFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await nurseDepartmentsModel.countDocuments();

    const Department = await nurseDepartmentsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateNurseDepartmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await nurseDepartmentsModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Department Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const getNurseDepartmentIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await nurseDepartmentsModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Nurse Department Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Nurse Department!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Nurse Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteNurseDepartmentAdmin = async (req, res) => {
  try {
    await nurseDepartmentsModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Department Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Department",
      error,
    });
  }
};


// for nurse skill department model

export const AddAdminSkillDepartmentController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new skillDepartmentsModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Skill Department Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Skill Department:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Skill Department",
      error,
    });
  }
};

export const getAllSkillDepartmentFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await skillDepartmentsModel.countDocuments();

    const Department = await skillDepartmentsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Skill Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Skill Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Skill Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateSkillDepartmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await skillDepartmentsModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Skill Department Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Skill Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const getSkillDepartmentIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await skillDepartmentsModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Skill Department Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Skill Department!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Skill Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteSkillDepartmentAdmin = async (req, res) => {
  try {
    await skillDepartmentsModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Department Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Department",
      error,
    });
  }
};

// for nurse Attribute department model

export const AddAdminAttributeDepartmentController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new attributeDepartmentsModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Department Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Attribute Department:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Attribute Department",
      error,
    });
  }
};

export const getAllAttributeDepartmentFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await attributeDepartmentsModel.countDocuments();

    const Department = await attributeDepartmentsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Attribute Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Attribute Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateAttributeDepartmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await attributeDepartmentsModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Skill Department Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Skill Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAttributeDepartmentIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await attributeDepartmentsModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Attribute Department Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Attribute Department!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Attribute Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteAttributeDepartmentAdmin = async (req, res) => {
  try {
    await attributeDepartmentsModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Attribute Department Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Department",
      error,
    });
  }
};

// for lead product Model

export const getAllLeadProductDepartment = async (req, res) => {
  try {
    const Department = await leadProductModel.find({}).lean();
    if (!Department) {
      return res.status(400).send({
        message: "NO Lead Product Found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Lead Product List ",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Lead Product ${error}`,
      success: false,
      error,
    });
  }
};

export const AddAdminLeadProductController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new leadProductModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Lead Product Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Lead Product:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Lead Product",
      error,
    });
  }
};

export const getAllLeadProductFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await leadProductModel.countDocuments();

    const Department = await leadProductModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Attribute Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Attribute Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateLeadProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await leadProductModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Lead Product Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Lead Product: ${error}`,
      success: false,
      error,
    });
  }
};

export const getLeadProductIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await leadProductModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Lead Product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Lead Product!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Lead Product: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteLeadProductAdmin = async (req, res) => {
  try {
    await leadProductModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Lead Product Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Lead Product",
      error,
    });
  }
};



export const editUserVerifyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      verified: status,
    };

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!user) {
      return res.status(200).send({
        message: "NO User found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating User: ${error}`,
      success: false,
      error,
    });
  }
};

export const profileVendorImage = upload.fields([
  { name: "Doc1", maxCount: 1 },
  { name: "Doc2", maxCount: 1 },
  { name: "Doc3", maxCount: 1 },
  { name: "ProfileFile", maxCount: 1 },
]);


export const profileDocImage = upload.fields([
  { name: "Doc1", maxCount: 1 },
  { name: "Doc2", maxCount: 1 },
  { name: "Doc3", maxCount: 1 },
  { name: "Doc4", maxCount: 1 },
    { name: "Doc5", maxCount: 1 },
      { name: "Doc6", maxCount: 1 },
        { name: "Doc7", maxCount: 1 },
          { name: "Doc8", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);


export const updateVendorProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      address,
      email,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
      department
    } = req.body;

    const Doc1 = req.files ? req.files.Doc1 : undefined;
    const Doc2 = req.files ? req.files.Doc2 : undefined;
    const Doc3 = req.files ? req.files.Doc3 : undefined;

    const profileImg = req.files ? req.files.ProfileFile : undefined;

    console.log("req.body", req.body, profileImg);

    let updateFields = {
      username,
      address,
      email,
      pincode,
      gender,
      state,
      statename,
      city,
      about,
      department,
    };

    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    if (Doc1 && Doc1[0]) {
      updateFields.Doc1 = Doc1[0].path; // Assumes profile[0] is the uploaded file
    }
    if (Doc2 && Doc2[0]) {
      updateFields.Doc2 = Doc2[0].path; // Assumes profile[0] is the uploaded file
    } if (Doc3 && Doc3[0]) {
      updateFields.Doc3 = Doc3[0].path; // Assumes profile[0] is the uploaded file
    }
    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const AllPaymentAdmin = async (req, res) => {
  try {
    const transactions = await buyPlanModel.find({ payment: 1 }).populate('userId', 'phone email username').sort({ createdAt: -1 }).lean();

    return res.status(200).send({
      success: true,
      message: "payments fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error payments fetched: ${error}`,
      success: false,
      error,
    });
  }
};


export const AdminAllEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    const skip = (page - 1) * limit;

    // Initialize the query object
    let query = {};

    // If userId is provided, filter by userId
    if (userId) {
      query.userId = userId; // Filter by userId
    }

    query.type = 1; // Filter by userId


    // If there's a search term, apply it to a specific field (assuming a text index exists on the model)
    if (searchTerm) {
      query.$text = { $search: searchTerm }; // Assuming your model has text indexes for search
    }

    // Count the total documents matching the query
    const total = await enquireModel.countDocuments(query);

    // Retrieve the data
    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username, email, phone, and address
      .populate('senderId', 'username email phone address') // Populate senderId with username, email, phone, and address
      .lean();

    const allvendor = await userModel.find({ type: 1 }).lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquiries found for the given criteria.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquiry list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      total,
      Enquire,
      allvendor
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error.message || error}`,
      success: false,
      error,
    });
  }
};

export const profileImageHealth = upload.fields([
  { name: "profile", maxCount: 1 },
]);


export const AdminGetAllEmployee = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds), type, and coordinates from query parameters
    const { type,filter,phone } = req.query;

    if (!type) {
      return res.status(200).send({
        message: 'Missing required parameters.',
        success: false,
      });
    }
 
    // Build the filter object
    const fillter = {};  // Only fetch employees with the type (assuming "employee")

 
    if(type && type !== 'none' ){
      fillter.type = type;
    }
    if(phone && phone !== 'none' ){
      fillter.phone = phone;
    }
    // Build the filter object
   if(filter !== 'none'){
    if(filter === '5' ){
      fillter.empType = 5;
    }
    else if(filter === '4' ){
      fillter.empType = 4;
    }else if(filter === '3'){
      fillter.empType = 3;
    }else if(filter === '2'){
      fillter.empType = 2;
    }else{
      fillter.empType = 5;
    }
  }
  
   
  console.log('fillter',filter)

    //  if (category) {
    //    const categories = Array.isArray(category) ? category : [category];
    //   filter.department = { $in: categories.map(id => new mongoose.Types.ObjectId(id)) };  // Use 'new' to create ObjectIds
    // }

    // Fetch users based on the filter
    const users = await userModel.find(fillter, '_id username email phone gender address company companyName companyGST companyAddress age weight');

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }
 

    return res.status(200).send({
      message: 'All User List',
      success: true,
      Users: users,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching employees: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const AdminGetuserPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    // Validate if phone is provided
    if (!phone) {
      return res.status(400).send({
        message: 'Phone number is required',
        success: false,
      });
    }

    // Find users with type: 2 and matching phone
    const users = await userModel.find({ type: 2, phone }, '_id username email phone gender');

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }

    return res.status(200).send({
      message: 'User(s) found',
      success: true,
      users,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching users: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const generateUserInvoicePDFView = async (req, res) => {
  try {

  const { id,rec } = req.params;

  const lastTransaction = await orderModel
    .findById(id)
    .limit(1) // Only get the most recent transaction
    .populate({
      path: "userId", // The field to populate
      select: "phone username email c_name gstin statename ", // Only select the phone and username fields from the User model
    })
    .lean(); // Convert documents to plain JavaScript objects

  // If lastTransaction is an array, you can access the first element like this
  const invoiceData = lastTransaction;
  
  // console.log(invoiceData);
  console.log('invoiceData.UserDetails',invoiceData);
 

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

// invoiceData.addProduct.forEach(product => {
//   product.amount = 30000; // Set your custom amount
//   product.total = 30000;  // Set your custom total
// });
// rec

  console.log('invoiceData',invoiceData)
 

  console.log('invoiceData.addProduct',invoiceData.addProduct)
  // Define the HTML content
  const htmlContent = `     <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-header-left" style="flex:none;">
          <img src="https://backend-2o7f.onrender.com/uploads/new/image-1726306777273.webp" alt="Company Logo" width="240">
        
        </div>
        <div class="invoice-header-right">
          <h2 style="margin-top:0px;">YNB Healthcare Pvt. Ltd.
 </h2>
 <p>WZ 10C, A-2 Block, Asalatpur Near Mata Chanan Devi Hospital, Janakpuri, New Delhi, 110058 </p>
<p> Contact - +91-8100188188 </p>
  <p> Email : support@ynbhealthcare.com </p>
         
                         
        </div>
      </div>

<div style="margin-bottom: 15px;margin-top: 15px;border-top-style: solid;border-top-width: 3pt;border-top-color: #4F81BC;"> </div>

          <div class="invoice-header">
        <div class="invoice-header-left">
                     <h2 style="margin-top:0px;">BILLED TO</h2>
 
           <p> <b> Name: </b> ${invoiceData?.UserDetails[0]?.name}</p>
            <p> <b> Email Id: </b> ${invoiceData?.UserDetails[0]?.email}</p>
            <p> <b>  Phone No.: </b> ${invoiceData?.UserDetails[0]?.phone}</p>
            <p> <b>  Address: </b> ${invoiceData?.UserDetails[0]?.address}</p>
            <p> <b>  GST: </b> 
            ${invoiceData?.UserDetails[0]?.company === 'yes' ? invoiceData?.UserDetails[0]?.companyGST : 'NA'}
            </p>


          
         
        </div>
        <div class="invoice-header-right">
          <h2 style="margin-top:0px;">TAX INVOICE</h2>
            <p> <b> Invoice No.:</b> #${invoiceData?.orderId}</p>
            
          <p> <b>  Delivery Date :</b> ${formatDate(
      invoiceData?.PickupDate
    )}     </p>

  <p> <b>  Renewal Date :</b> ${formatDate(
      invoiceData?.ReturnDate
    )}     </p>
  
        <p> <b>  GSTIN:</b> 07AAACY9494K1ZJ    </p>

        </div>
      </div>


 <table class="invoice-table" style="margin-bottom:0px;">
  <thead>
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Quantity</th>
      <th>Tax (%)</th>
      <th>Total Amount</th>
    </tr>
  </thead>
  <tbody>
    ${invoiceData.addProduct && invoiceData.addProduct.length > 0
      ? invoiceData.addProduct.map((product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${product.title} ${rec ? `for ${invoiceData.addReceived[Number(rec)].days}Days` : ''}</td>
          <td>${product.quantity}</td>
          <td>${product.tax || 0}</td>
          <td>₹ ${rec ? invoiceData.addReceived[Number(rec)].amount : product.total.toFixed(2)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="6" class="text-center">No products added</td></tr>`
    }
  </tbody>
</table>

${invoiceData.addProduct && invoiceData.addProduct.length > 0 ? `
  <div class="col-md-4 ms-auto" style="width:33%;margin-left:auto;margin-top:10px;">
    <table class="invoice-table" >
      <tbody  >
        <tr >
          <th>Subtotal:</th>
          <td>₹ ${rec ? invoiceData.addReceived[Number(rec)].amount : invoiceData.subtotal.toFixed(2)}</td>
        </tr>

        <tr>
          <th>Discount:</th>
          <td>
           ${invoiceData.discount}
          </td>
        </tr>

        <tr>
          <th>Shipping:</th>
          <td>
           ${invoiceData.shipping}
          </td>
        </tr>

        <tr>
          <th>
            Tax ${invoiceData.applyIGST ? '(IGST)' : '(CGST + SGST)'}:
            
          </th>
          <td>₹ ${(invoiceData.applyIGST || invoiceData.applyCGST || invoiceData.applySGST) ? invoiceData.taxTotal.toFixed(2) : '0.00'}</td>
        </tr>

        <tr>
          <th>Final Total:</th>
          <td><strong>₹ ${rec ? invoiceData.addReceived[Number(rec)].amount : invoiceData.totalAmount.toFixed(2)}
          </strong></td>
        </tr>
      </tbody>
    </table>
  </div>
` : ''}
${invoiceData.type === 2 ?  `

<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4>Rental Amount</h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addRental && invoiceData.addRental.length > 0 ? invoiceData.addRental.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addRental && invoiceData.addRental.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addRental.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>


<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4>Security Amount Received</h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addReceived && invoiceData.addReceived.length > 0 ? invoiceData.addReceived.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addReceived && invoiceData.addReceived.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addReceived.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>

     
<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4> Security Amount Return
 </h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addReturn && invoiceData.addReturn.length > 0 ? invoiceData.addReturn.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addReturn && invoiceData.addReturn.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addReturn.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>

  ` : ''}

<br>
     <p style="text-align:center" >This is a Computer Generated Invoice </p>
 <br>
 <div style="text-align:center;">
 
 </div>

      <button class="btn" onclick="window.print()">Print Page</button>
 <br>


    </div>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h2 {
        font-weight: 700;
      }
        h1,h2{
        font-size: 14pt;
}
        p,td,th{font-size: 10pt;}
      .invoice {
        width: 95%;
        margin: 10px auto;
        padding: 20px;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 20px;
      }
      .invoice-header-left {
        flex: 1;
      }
      .invoice-header-right {
        flex: 1;
        text-align: right;
      }
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10%;
      }
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
      }
      .invoice-table th {
      
        color:green;
    
      }
      .invoice-total {
        float: right;
      }

      
    .btn {
      display: inline-block;
      text-decoration: none;
      background-color: #007bff;
      color: #fff;
      padding: 12px 24px;
      border-radius: 5px;
      transition: background-color 0.3s ease;
      cursor: pointer;
    }

    .btn:hover {
      background-color: #0056b3;
    }

    @media print {
      .btn {
        display: none;
      }
    }

    </style>
  `;

  res.send(htmlContent);

} catch (error) {
  console.error("Error generating invoice PDF view:", error.message);
  // Redirect to YNB.com on error
  const htmlContent =`
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 Not Found</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f8f8f8;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      color: #333;
    }

    .container {
      max-width: 600px;
    }

    h1 {
      font-size: 120px;
      margin-bottom: 20px;
      color: #ff6b6b;
    }

    h2 {
      font-size: 32px;
      margin-bottom: 10px;
    }

    p {
      font-size: 18px;
      margin-bottom: 30px;
    }

    a {
      display: inline-block;
      text-decoration: none;
      background-color: #007bff;
      color: #fff;
      padding: 12px 24px;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }

    a:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>Sorry, the page you’re looking for doesn’t exist.</p>
   </div>

</body>
</html>

    `;

  res.send(htmlContent);
}

};

export const downloadUserAdminInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body; // Assuming invoiceData is sent in the request body
    if (!invoiceId) {
      return res.status(400).send("Invoice ID is required");
    }
    // Fetch invoice data from the database
    const invoiceData = await orderModel
      .findById(invoiceId)
      .populate("userId");

      console.log('invoiceData',invoiceData)
    const pdfBuffer = await generateUserInvoicePDF(invoiceData);

    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
      await execPromise("npx puppeteer browsers install chrome");
    await execPromise("npm install puppeteer");
 

    console.error("Error generating invoice PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};


const generateUserInvoicePDF = async (invoiceData) => {
    console.log('invoiceData',invoiceData);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
 
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };


  
  // Define the HTML content
  const htmlContent = `     <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-header-left" style="flex:none;">
          <img src="https://backend-2o7f.onrender.com/uploads/new/image-1726306777273.webp" alt="Company Logo" width="240">
        
        </div>
        <div class="invoice-header-right">
          <h2 style="margin-top:0px;">Ynb Healthcare Pvt. Ltd.
 </h2>
 <p>45, Kisan Agro Mall, Mandi Road, Jhansi, Uttar Pradesh - 284001 </p>
<p> Contact - +91-8100188188 </p>
  <p> Email : support@ynbhealthcare.com </p>
         
                         
        </div>
      </div>

<div style="margin-bottom: 15px;margin-top: 15px;border-top-style: solid;border-top-width: 3pt;border-top-color: #4F81BC;"> </div>

          <div class="invoice-header">
        <div class="invoice-header-left">
                     <h2 style="margin-top:0px;">BILLED TO</h2>
 
           <p> <b> Name: </b> ${invoiceData?.UserDetails[0]?.name}</p>
            <p> <b> Email Id: </b> ${invoiceData?.UserDetails[0]?.email}</p>
            <p> <b>  Phone No.: </b> ${invoiceData?.UserDetails[0]?.phone}</p>
                      <p> <b>  Address: </b> ${invoiceData?.UserDetails[0]?.address}</p>
            <p> <b>  GST: </b> 
            ${invoiceData?.UserDetails[0]?.company === 'yes' ? invoiceData?.UserDetails[0]?.companyGST : 'NA'}
            </p>
          
         
        </div>
        <div class="invoice-header-right">
          <h2 style="margin-top:0px;">TAX INVOICE</h2>
            <p> <b> Invoice No.:</b> #${invoiceData?.orderId}</p>
            
          <p> <b>  Pickup Date:</b> ${formatDate(
      invoiceData?.PickupDate
    )}     </p>

  <p> <b>  Return Date:</b> ${formatDate(
      invoiceData?.ReturnDate
    )}     </p>

      <p> <b>  GSTIN:</b> 07AAACY9494K1ZJ    </p>
  
        </div>
      </div>


 <table class="invoice-table" style="margin-bottom:0px;">
  <thead>
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Price</th>
      <th>Quantity</th>
      <th>Tax (%)</th>
      <th>Total Amount</th>
    </tr>
  </thead>
  <tbody>
    ${invoiceData.addProduct && invoiceData.addProduct.length > 0
      ? invoiceData.addProduct.map((product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${product.title}</td>
          <td>₹ ${product.amount.toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td>${product.tax || 0}</td>
          <td>₹ ${product.total.toFixed(2)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="6" class="text-center">No products added</td></tr>`
    }
  </tbody>
</table>

${invoiceData.addProduct && invoiceData.addProduct.length > 0 ? `
  <div class="col-md-4 ms-auto" style="width:33%;margin-left:auto;margin-top:10px;">
    <table class="invoice-table" >
      <tbody  >
        <tr >
          <th>Subtotal:</th>
          <td>₹ ${invoiceData.subtotal.toFixed(2)}</td>
        </tr>

        <tr>
          <th>Discount:</th>
          <td>
           ${invoiceData.discount}
          </td>
        </tr>

        <tr>
          <th>Shipping:</th>
          <td>
           ${invoiceData.shipping}
          </td>
        </tr>

        <tr>
          <th>
            Tax ${invoiceData.applyIGST ? '(IGST)' : '(CGST + SGST)'}:
            
          </th>
          <td>₹ ${(invoiceData.applyIGST || invoiceData.applyCGST || invoiceData.applySGST) ? invoiceData.taxTotal.toFixed(2) : '0.00'}</td>
        </tr>

        <tr>
          <th>Final Total:</th>
          <td><strong>₹ ${invoiceData.totalAmount.toFixed(2)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
` : ''}

<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4>Rental Amount</h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addRental && invoiceData.addRental.length > 0 ? invoiceData.addRental.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addRental && invoiceData.addRental.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addRental.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>


<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4>Security Amount Received</h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addReceived && invoiceData.addReceived.length > 0 ? invoiceData.addReceived.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addReceived && invoiceData.addReceived.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addReceived.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>

     
<div class="col-md-12 my-4">
  <div class="d-flex justify-content-between">
    <h4> Security Amount Return
 </h4>
    
  </div>
  <hr />

  <div class="overflow-auto">
    <table class="invoice-table" id="rental-table" style="margin-bottom:0px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount INR</th>
          <th>Gateway</th>
          <th>Payment Method</th>
          <th>Transaction Id</th>
         </tr>
      </thead>
      <tbody id="rental-table-body">
        ${invoiceData.addReturn && invoiceData.addReturn.length > 0 ? invoiceData.addReturn.map((rental, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${rental.date}</td>
            <td>${rental.time}</td>
            <td>${rental.amount}</td>
            <td>${rental.gateway}</td>
            <td>${rental.method}</td>
            <td>${rental.transaction}</td>
            
          </tr>
        `).join('') : `
          <tr>
            <td colspan="8" class="text-center">No Rental Added</td>
          </tr>
        `}
      </tbody>
    </table>
  </div>

  ${invoiceData.addReturn && invoiceData.addReturn.length > 0 ? `
    <div class="col-md-4 ms-auto" style="max-width:33%;margin-left:auto;">
      <table  class="invoice-table" id="rental-table" style="margin-bottom:0px;margin-top:10px;">
        <tbody>
          <tr>
            <th>Final Total:</th>
            <td><strong>₹ ${invoiceData.addReturn.reduce((acc, rental) => acc + parseFloat(rental.amount || 0), 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}
</div>


<br>
     <p style="text-align:center" >This is a Computer Generated Invoice </p>
 <br>



    </div>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h2 {
        font-weight: 700;
      }
        h1,h2{
        font-size: 14pt;
}
        p,td,th{font-size: 10pt;}
      .invoice {
        width: 95%;
        margin: 10px auto;
        padding: 20px;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 20px;
      }
      .invoice-header-left {
        flex: 1;
      }
      .invoice-header-right {
        flex: 1;
        text-align: right;
      }
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10%;
      }
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
      }
      .invoice-table th {
      
        color:green;
    
      }
      .invoice-total {
        float: right;
      }
    </style>
  `;


  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return pdfBuffer;
};
